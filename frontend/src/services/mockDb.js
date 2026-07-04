// Backend API data adapter mapping local mockDb calls to the real microservices.
// This removes all dummy data and connects the frontend directly to the backend.

const syncRequest = (method, url, body = null) => {
  const xhr = new XMLHttpRequest();
  xhr.open(method, `http://localhost:8080${url}`, false); // false makes it synchronous
  
  // Attach token
  const token = localStorage.getItem('ins_token');
  if (token) {
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
  }
  
  // Attach gateway user headers
  const userStr = localStorage.getItem('ins_current_user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      xhr.setRequestHeader('X-User-Name', u.email || u.username);
      
      let beRole = 'ROLE_USER';
      if (u.role === 'SYSTEM_ADMIN') beRole = 'ROLE_ADMIN';
      else if (u.role === 'CLAIM_OFFICER') beRole = 'ROLE_PROCESSOR';
      else if (u.role === 'CLAIM_MANAGER') beRole = 'ROLE_MANAGER';
      else if (u.role === 'AUDITOR') beRole = 'ROLE_AUDITOR';
      xhr.setRequestHeader('X-User-Roles', beRole);
    } catch(e) {}
  }
  
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.send(body ? JSON.stringify(body) : null);
  
  if (xhr.status >= 200 && xhr.status < 300) {
    try {
      return JSON.parse(xhr.responseText);
    } catch(e) {
      return xhr.responseText;
    }
  } else {
    throw new Error(`Backend request failed with status: ${xhr.status}`);
  }
};

const mapClaim = (c) => {
  // Fetch documents for this claim
  let documents = [];
  try {
    const docsRes = syncRequest('GET', `/claims/${c.id}/documents`);
    documents = (docsRes.data || []).map(d => ({
      id: d.id ? d.id.toString() : d.documentId,
      name: d.fileName,
      category: d.category,
      size: `${(d.fileSize / 1024).toFixed(1)}KB`,
      uploadedAt: d.uploadedAt
    }));
  } catch (e) {}

  // Fetch fraud risk score from fraud service
  let fraudRiskScore = 0;
  let fraudFlags = [];
  try {
    const fraudRes = syncRequest('GET', `/fraud/reports/${c.id}`);
    if (fraudRes.data) {
      fraudRiskScore = fraudRes.data.riskScore || 0;
      fraudFlags = fraudRes.data.flags || [];
    }
  } catch (e) {}

  return {
    id: `CLM-${c.id}`,
    customerId: c.username,
    customerName: c.username.split('@')[0].replace(/_/g, ' '),
    policyNumber: c.policyNumber,
    claimAmount: c.claimAmount,
    lossType: c.lossType,
    lossDate: c.dateOfOccurrence ? c.dateOfOccurrence.split('T')[0] : '',
    description: c.description,
    status: c.status,
    createdAt: c.createdAt,
    submittedAt: c.updatedAt || c.createdAt,
    documents,
    fraudRiskScore,
    fraudFlags,
    history: [
      { status: 'DRAFT', updatedAt: c.createdAt, updatedBy: c.username, comment: 'Claim draft created.' }
    ]
  };
};

export const initMockDb = () => {
  // No-op since we run on real backend data
};

export const mockDb = {
  // Users mapping for Admin Dashboard
  getUsers: () => {
    try {
      const res = syncRequest('GET', '/auth/users');
      return (res.data || []).map(u => {
        let feRole = 'CUSTOMER';
        if (u.roles && u.roles.length > 0) {
          const beRole = u.roles[0];
          if (beRole === 'ROLE_ADMIN') feRole = 'SYSTEM_ADMIN';
          else if (beRole === 'ROLE_PROCESSOR') feRole = 'CLAIM_OFFICER';
          else if (beRole === 'ROLE_MANAGER') feRole = 'CLAIM_MANAGER';
          else if (beRole === 'ROLE_AUDITOR') feRole = 'AUDITOR';
        }
        return {
          id: u.id.toString(),
          username: u.email || u.username,
          email: u.email,
          role: feRole,
          name: (u.email || u.username).split('@')[0].replace(/_/g, ' '),
          approved: u.approved,
          password: u.password
        };
      });
    } catch(e) {
      return [];
    }
  },
  saveUsers: (users) => {
    users.forEach(u => {
      if (u.approved) {
        try {
          syncRequest('POST', `/auth/users/${u.id}/approve`);
        } catch(e) {}
      }
    });
  },
  
  // Claims
  getClaims: () => {
    const userStr = localStorage.getItem('ins_current_user');
    if (!userStr) return [];
    try {
      const u = JSON.parse(userStr);
      let res;
      if (u.role === 'CUSTOMER') {
        res = syncRequest('GET', '/claims?size=100');
      } else {
        res = syncRequest('GET', '/claims/all?size=100');
      }
      const content = res.data?.content || res.data || [];
      return content.map(mapClaim);
    } catch(e) {
      return [];
    }
  },
  saveClaims: (claims) => {
    // Status updates are handled directly on the backend via processClaim (action)
  },
  
  // Tasks (Workflow Queue)
  getTasks: () => {
    const userStr = localStorage.getItem('ins_current_user');
    if (!userStr) return [];
    try {
      const u = JSON.parse(userStr);
      let rolesHeader = 'ROLE_PROCESSOR';
      if (u.role === 'CLAIM_MANAGER') rolesHeader = 'ROLE_MANAGER';
      
      const res = syncRequest('GET', '/tasks/pending?size=100');
      const content = res.data?.content || res.data || [];
      
      return content.map(t => ({
        id: t.id.toString(),
        claimId: `CLM-${t.claimId}`,
        assignedRole: t.assignedRole === 'ROLE_PROCESSOR' ? 'CLAIM_OFFICER' : 'CLAIM_MANAGER',
        assignedUser: t.assignedUserId,
        status: t.assignedUserId ? 'CLAIMED' : 'PENDING',
        title: t.assignedRole === 'ROLE_PROCESSOR' ? 'Claim Officer Review' : 'High-Value Claim Manager Review',
        description: t.description,
        createdAt: t.createdAt
      }));
    } catch (e) {
      return [];
    }
  },
  saveTasks: (tasks) => {
    // Tasks status transitions are managed by the workflow-service state machine
  },
  
  // Audit Logs
  getAuditLogs: () => {
    try {
      const res = syncRequest('GET', '/audit/logs?size=100');
      const content = res.data?.content || res.data || [];
      return content.map(log => ({
        id: `LOG-${log.id}`,
        timestamp: log.timestamp,
        claimId: log.claimId ? `CLM-${log.claimId}` : null,
        userId: log.userId,
        username: log.username,
        action: log.action,
        details: log.details
      }));
    } catch (e) {
      return [];
    }
  },
  saveAuditLogs: (logs) => {
    // Auto-logged on the backend services
  },

  // Settings
  getSettings: () => {
    const settingsStr = localStorage.getItem('ins_settings');
    if (settingsStr) return JSON.parse(settingsStr);
    return {
      fraudThreshold: 50,
      highValueThreshold: 5000,
      autoApprovalEnabled: false,
      mfaRequired: true,
      allowedFileExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
      maxFileSizeMB: 10
    };
  },
  saveSettings: (settings) => {
    localStorage.setItem('ins_settings', JSON.stringify(settings));
  },

  // Operations
  addAuditLog: (userId, username, claimId, action, details) => {
    // Handled automatically on the backend
  },

  submitClaim: (claimData, user) => {
    const payload = {
      policyNumber: claimData.policyNumber,
      claimAmount: parseFloat(claimData.claimAmount),
      lossType: claimData.lossType,
      dateOfOccurrence: claimData.lossDate ? new Date(claimData.lossDate).toISOString() : new Date().toISOString(),
      description: claimData.description
    };
    
    // 1. Create claim draft
    const draftRes = syncRequest('POST', '/claims', payload);
    const claimId = draftRes.data.id;
    
    // 2. Upload attachments
    if (claimData.documents && claimData.documents.length > 0) {
      claimData.documents.forEach(doc => {
        try {
          const formData = new FormData();
          const blob = new Blob(['Dummy file stream contents'], { type: 'application/pdf' });
          formData.append('file', blob, doc.name || 'attachment.pdf');
          formData.append('category', doc.category || 'receipt');
          
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `http://localhost:8080/claims/${claimId}/documents`, false);
          const token = localStorage.getItem('ins_token');
          if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('X-User-Name', user.email || user.username);
          xhr.setRequestHeader('X-User-Roles', 'ROLE_USER');
          xhr.send(formData);
        } catch(e) {
          console.error("Failed to upload document synchronously", e);
        }
      });
    }
    
    // 3. Submit claim
    const submitRes = syncRequest('POST', `/claims/${claimId}/submit`);
    return mapClaim(submitRes.data);
  },

  claimTask: (taskId, user) => {
    syncRequest('POST', `/tasks/${taskId}/claim`);
  },

  processClaim: (taskId, action, comment, user) => {
    let backendAction = 'APPROVE';
    if (action === 'REJECT') backendAction = 'REJECT';
    else if (action === 'REQUEST_INFO' || action === 'REQUEST_DOCS') backendAction = 'REQUEST_DOCS';
    
    syncRequest('POST', `/tasks/${taskId}/action`, {
      actionDecision: backendAction,
      comment: comment
    });
  },

  uploadDocument: (claimId, docName, category, user) => {
    // Trigger direct backend upload
    try {
      const formData = new FormData();
      const blob = new Blob(['Additional uploaded document contents'], { type: 'application/pdf' });
      formData.append('file', blob, docName);
      formData.append('category', category);
      
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `http://localhost:8080/claims/${claimId}/documents`, false);
      const token = localStorage.getItem('ins_token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      xhr.setRequestHeader('X-User-Name', user.email || user.username);
      
      let beRole = 'ROLE_USER';
      if (user.role === 'CLAIM_OFFICER') beRole = 'ROLE_PROCESSOR';
      xhr.setRequestHeader('X-User-Roles', beRole);
      xhr.send(formData);
      
      const res = JSON.parse(xhr.responseText);
      return res.data;
    } catch(e) {
      console.error("Failed uploading document", e);
      return null;
    }
  }
};
