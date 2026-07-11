import api from './api';

const mapClaim = async (c) => {
  // Fetch documents for this claim
  let documents = [];
  try {
    const docsRes = await api.get(`/claims/${c.id}/documents`);
    const docsData = docsRes.data.data || docsRes.data || [];
    documents = docsData.map(d => ({
      id: d.id ? d.id.toString() : d.documentId,
      name: d.fileName,
      category: d.category,
      size: d.fileSize ? `${(d.fileSize / 1024).toFixed(1)}KB` : '0KB',
      uploadedAt: d.uploadedAt
    }));
  } catch (e) {}

  // Fetch fraud risk score from fraud service
  let fraudRiskScore = 0;
  let fraudFlags = [];
  try {
    const fraudRes = await api.get(`/fraud/reports/${c.id}`);
    const fraudData = fraudRes.data.data || fraudRes.data;
    if (fraudData) {
      fraudRiskScore = fraudData.riskScore || 0;
      fraudFlags = typeof fraudData.flags === 'string' ? fraudData.flags.split(',') : (fraudData.flags || []);
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
  getUsers: async () => {
    try {
      const res = await api.get('/auth/users');
      const list = res.data.data || res.data || [];
      return list.map(u => {
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
  saveUsers: async (users) => {
    for (const u of users) {
      if (u.approved) {
        try {
          await api.post(`/auth/users/${u.id}/approve`);
        } catch(e) {}
      }
    }
  },
  
  // Claims
  getClaims: async () => {
    const userStr = localStorage.getItem('ins_current_user');
    if (!userStr) return [];
    try {
      const u = JSON.parse(userStr);
      let res;
      if (u.role === 'CUSTOMER') {
        res = await api.get('/claims?size=100');
      } else {
        res = await api.get('/claims/all?size=100');
      }
      const data = res.data.data || res.data;
      const content = data.content || data || [];
      return await Promise.all(content.map(mapClaim));
    } catch(e) {
      return [];
    }
  },
  saveClaims: async (claims) => {
    // Status updates are handled directly on the backend via processClaim (action)
  },
  
  // Tasks (Workflow Queue)
  getTasks: async () => {
    const userStr = localStorage.getItem('ins_current_user');
    if (!userStr) return [];
    try {
      const res = await api.get('/tasks/pending?size=100');
      const data = res.data.data || res.data;
      const content = data.content || data || [];
      
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
  saveTasks: async (tasks) => {
    // Tasks status transitions are managed by the workflow-service state machine
  },
  
  // Audit Logs
  getAuditLogs: async () => {
    try {
      const res = await api.get('/audit/logs?size=100');
      const data = res.data.data || res.data;
      const content = data.content || data || [];
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
  saveAuditLogs: async (logs) => {
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
  addAuditLog: async (userId, username, claimId, action, details) => {
    // Handled automatically on the backend
  },

  submitClaim: async (claimData, user) => {
    const payload = {
      policyNumber: claimData.policyNumber,
      claimAmount: parseFloat(claimData.claimAmount),
      lossType: claimData.lossType,
      dateOfOccurrence: claimData.lossDate ? new Date(claimData.lossDate).toISOString() : new Date().toISOString(),
      description: claimData.description
    };
    
    // 1. Create claim draft
    const draftRes = await api.post('/claims', payload);
    const draftData = draftRes.data.data || draftRes.data;
    const claimId = draftData.id;
    
    // 2. Upload attachments
    if (claimData.documents && claimData.documents.length > 0) {
      for (const doc of claimData.documents) {
        if (doc.file) {
          try {
            const formData = new FormData();
            formData.append('file', doc.file);
            formData.append('category', doc.category || 'receipt');
            
            await api.post(`/claims/${claimId}/documents`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
          } catch(e) {
            console.error("Failed to upload document", e);
          }
        }
      }
    }
    
    // 3. Submit claim
    const submitRes = await api.post(`/claims/${claimId}/submit`);
    const submitData = submitRes.data.data || submitRes.data;
    return await mapClaim(submitData);
  },

  claimTask: async (taskId, user) => {
    await api.post(`/tasks/${taskId}/claim`);
  },

  processClaim: async (taskId, action, comment, user) => {
    let backendAction = 'APPROVE';
    if (action === 'REJECT') backendAction = 'REJECT';
    else if (action === 'REQUEST_INFO' || action === 'REQUEST_DOCS') backendAction = 'REQUEST_DOCS';
    
    await api.post(`/tasks/${taskId}/action`, {
      actionDecision: backendAction,
      comment: comment
    });
  },

  uploadDocument: async (claimId, file, category, user) => {
    try {
      const cleanClaimId = claimId.toString().replace('CLM-', '');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      
      await api.post(`/claims/${cleanClaimId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      const claimRes = await api.get(`/claims/${cleanClaimId}`);
      const updatedClaim = claimRes.data.data || claimRes.data;
      return await mapClaim(updatedClaim);
    } catch(e) {
      console.error("Failed uploading document", e);
      return null;
    }
  }
};
