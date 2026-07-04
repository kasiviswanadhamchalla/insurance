// Mock Database stored in LocalStorage for persistence across logins and page reloads.

const DEFAULT_USERS = [
  { id: '1', username: 'customer@insurance.com', email: 'customer@insurance.com', password: 'Password123!', role: 'CUSTOMER', name: 'John Doe', mfaEnabled: true, approved: true },
  { id: '2', username: 'claim_officer@insurance.com', email: 'claim_officer@insurance.com', password: 'Password123!', role: 'CLAIM_OFFICER', name: 'Alice Smith', mfaEnabled: true, approved: true },
  { id: '3', username: 'manager@insurance.com', email: 'manager@insurance.com', password: 'Password123!', role: 'CLAIM_MANAGER', name: 'Bob Johnson', mfaEnabled: true, approved: true },
  { id: '4', username: 'auditor@insurance.com', email: 'auditor@insurance.com', password: 'Password123!', role: 'AUDITOR', name: 'Carol Williams', mfaEnabled: true, approved: true },
  { id: '5', username: 'admin@insurance.com', email: 'admin@insurance.com', password: 'Password123!', role: 'SYSTEM_ADMIN', name: 'Dave Brown', mfaEnabled: true, approved: true },
];

const DEFAULT_CLAIMS = [
  {
    id: 'CLM-1001',
    customerId: '1',
    customerName: 'John Doe',
    policyNumber: 'POL-12345678',
    claimAmount: 1250.00,
    lossType: 'Auto Collision',
    lossDate: '2026-06-15',
    description: 'Rear-ended by another vehicle at an intersection. Damage to the bumper and trunk.',
    status: 'APPROVED',
    createdAt: '2026-06-16T10:00:00Z',
    submittedAt: '2026-06-16T10:15:00Z',
    documents: [
      { id: 'doc-1', name: 'police_report.pdf', category: 'Police Report', size: '1.2MB', uploadedAt: '2026-06-16T10:10:00Z' },
      { id: 'doc-2', name: 'repair_estimate.pdf', category: 'Repair Estimate', size: '850KB', uploadedAt: '2026-06-16T10:12:00Z' }
    ],
    fraudRiskScore: 12,
    fraudFlags: [],
    history: [
      { status: 'DRAFT', updatedAt: '2026-06-16T10:00:00Z', updatedBy: 'John Doe', comment: 'Draft claim created.' },
      { status: 'SUBMITTED', updatedAt: '2026-06-16T10:15:00Z', updatedBy: 'John Doe', comment: 'Claim submitted for processing.' },
      { status: 'PENDING_REVIEW', updatedAt: '2026-06-16T10:16:00Z', updatedBy: 'System Engine', comment: 'Automated policy validation passed. Placed in Processor review queue.' },
      { status: 'APPROVED', updatedAt: '2026-06-18T14:30:00Z', updatedBy: 'Alice Smith', comment: 'Receipts verified, estimate matches policy coverage. Approved payout.' }
    ]
  },
  {
    id: 'CLM-1002',
    customerId: '1',
    customerName: 'John Doe',
    policyNumber: 'POL-12345678',
    claimAmount: 8400.00,
    lossType: 'Water Damage',
    lossDate: '2026-06-20',
    description: 'Burst pipe under the kitchen sink flooded the ground floor hardwood flooring and cabinets.',
    status: 'FLAGGED_FOR_REVIEW',
    createdAt: '2026-06-21T09:30:00Z',
    submittedAt: '2026-06-21T09:45:00Z',
    documents: [
      { id: 'doc-3', name: 'plumber_invoice.pdf', category: 'Plumber Invoice', size: '450KB', uploadedAt: '2026-06-21T09:40:00Z' },
      { id: 'doc-4', name: 'damage_photos.zip', category: 'Damage Photo', size: '14.5MB', uploadedAt: '2026-06-21T09:44:00Z' }
    ],
    fraudRiskScore: 78,
    fraudFlags: ['HIGH_VALUE_THRESHOLD', 'RECENT_POLICY_CHANGE'],
    history: [
      { status: 'DRAFT', updatedAt: '2026-06-21T09:30:00Z', updatedBy: 'John Doe', comment: 'Draft claim created.' },
      { status: 'SUBMITTED', updatedAt: '2026-06-21T09:45:00Z', updatedBy: 'John Doe', comment: 'Claim submitted for processing.' },
      { status: 'FLAGGED_FOR_REVIEW', updatedAt: '2026-06-21T09:46:00Z', updatedBy: 'System Engine', comment: 'Fraud rules triggered: High value amount (>=$5,000) and recent policy renewal. Escalated to Manager queue.' }
    ]
  },
  {
    id: 'CLM-1003',
    customerId: '1',
    customerName: 'John Doe',
    policyNumber: 'POL-12345678',
    claimAmount: 450.00,
    lossType: 'Theft/Burglary',
    lossDate: '2026-07-01',
    description: 'Bicycle stolen from apartment building garage. Lock was cut.',
    status: 'PENDING_REVIEW',
    createdAt: '2026-07-02T11:00:00Z',
    submittedAt: '2026-07-02T11:10:00Z',
    documents: [
      { id: 'doc-5', name: 'bike_receipt.pdf', category: 'Purchase Receipt', size: '320KB', uploadedAt: '2026-07-02T11:08:00Z' }
    ],
    fraudRiskScore: 5,
    fraudFlags: [],
    history: [
      { status: 'DRAFT', updatedAt: '2026-07-02T11:00:00Z', updatedBy: 'John Doe', comment: 'Draft claim created.' },
      { status: 'SUBMITTED', updatedAt: '2026-07-02T11:10:00Z', updatedBy: 'John Doe', comment: 'Claim submitted for processing.' },
      { status: 'PENDING_REVIEW', updatedAt: '2026-07-02T11:11:00Z', updatedBy: 'System Engine', comment: 'Automated validation check passed. Assigned to standard processing queue.' }
    ]
  }
];

const DEFAULT_TASKS = [
  {
    id: 'TSK-2001',
    claimId: 'CLM-1002',
    assignedRole: 'CLAIM_MANAGER',
    assignedUser: null,
    status: 'PENDING',
    title: 'High-Value Water Damage Claim Review',
    description: 'Review $8,400 water damage claim. Requires Manager authorization due to high value and fraud flags.',
    createdAt: '2026-06-21T09:46:00Z'
  },
  {
    id: 'TSK-2002',
    claimId: 'CLM-1003',
    assignedRole: 'CLAIM_OFFICER',
    assignedUser: null,
    status: 'PENDING',
    title: 'Bicycle Theft Claim Inspection',
    description: 'Verify purchase receipt and police report for stolen bicycle ($450).',
    createdAt: '2026-07-02T11:11:00Z'
  }
];

const DEFAULT_AUDIT_LOGS = [
  { id: 'LOG-3001', timestamp: '2026-06-16T10:00:00Z', claimId: 'CLM-1001', userId: '1', username: 'customer@insurance.com', action: 'CREATE_DRAFT', details: 'Claim CLM-1001 initialized.' },
  { id: 'LOG-3002', timestamp: '2026-06-16T10:15:00Z', claimId: 'CLM-1001', userId: '1', username: 'customer@insurance.com', action: 'SUBMIT_CLAIM', details: 'Claim CLM-1001 submitted. Total: $1250.00.' },
  { id: 'LOG-3003', timestamp: '2026-06-16T10:16:00Z', claimId: 'CLM-1001', userId: 'SYSTEM', username: 'System Engine', action: 'AUTO_VALIDATION', details: 'Rules evaluated. Risk Score: 12. Result: PENDING_REVIEW.' },
  { id: 'LOG-3004', timestamp: '2026-06-18T14:28:00Z', claimId: 'CLM-1001', userId: '2', username: 'processor@insurance.com', action: 'CLAIM_TASK', details: 'Processor claimed task for CLM-1001.' },
  { id: 'LOG-3005', timestamp: '2026-06-18T14:30:00Z', claimId: 'CLM-1001', userId: '2', username: 'processor@insurance.com', action: 'APPROVE_CLAIM', details: 'Claim CLM-1001 approved. Payout initiated.' },
  { id: 'LOG-3006', timestamp: '2026-06-21T09:30:00Z', claimId: 'CLM-1002', userId: '1', username: 'customer@insurance.com', action: 'CREATE_DRAFT', details: 'Claim CLM-1002 initialized.' },
  { id: 'LOG-3007', timestamp: '2026-06-21T09:45:00Z', claimId: 'CLM-1002', userId: '1', username: 'customer@insurance.com', action: 'SUBMIT_CLAIM', details: 'Claim CLM-1002 submitted. Total: $8400.00.' },
  { id: 'LOG-3008', timestamp: '2026-06-21T09:46:00Z', claimId: 'CLM-1002', userId: 'SYSTEM', username: 'System Engine', action: 'AUTO_VALIDATION', details: 'Rules evaluated. Risk Score: 78. Result: FLAGGED_FOR_REVIEW. Escalated due to HIGH_VALUE_THRESHOLD.' }
];

const DEFAULT_SYSTEM_SETTINGS = {
  fraudThreshold: 50,
  highValueThreshold: 5000,
  autoApprovalEnabled: false,
  mfaRequired: true,
  allowedFileExtensions: ['pdf', 'png', 'jpg', 'jpeg'],
  maxFileSizeMB: 10
};

// Initialize DB structure in LocalStorage
export const initMockDb = () => {
  if (!localStorage.getItem('ins_users')) {
    localStorage.setItem('ins_users', JSON.stringify(DEFAULT_USERS));
  } else {
    // Migration: Update default roles and credentials of standard templates
    try {
      let usersList = JSON.parse(localStorage.getItem('ins_users') || '[]');
      DEFAULT_USERS.forEach(defUser => {
        const idx = usersList.findIndex(u => u.id === defUser.id);
        if (idx > -1) {
          usersList[idx].username = defUser.username;
          usersList[idx].email = defUser.email;
          usersList[idx].role = defUser.role;
          usersList[idx].password = defUser.password;
          usersList[idx].approved = defUser.approved;
        } else {
          usersList.push(defUser);
        }
      });
      localStorage.setItem('ins_users', JSON.stringify(usersList));
    } catch (e) {
      console.error('Failed to run users DB migration', e);
    }
  }

  if (!localStorage.getItem('ins_claims')) {
    localStorage.setItem('ins_claims', JSON.stringify(DEFAULT_CLAIMS));
  }

  if (!localStorage.getItem('ins_tasks')) {
    localStorage.setItem('ins_tasks', JSON.stringify(DEFAULT_TASKS));
  } else {
    // Migration: Update tasks assigned roles to the new keys
    try {
      let tasksList = JSON.parse(localStorage.getItem('ins_tasks') || '[]');
      let updated = false;
      tasksList = tasksList.map(t => {
        if (t.assignedRole === 'CLAIM_PROCESSOR' || t.assignedRole === 'FRAUD_DETECTION_OFFICER') {
          t.assignedRole = 'CLAIM_OFFICER';
          updated = true;
        }
        if (t.assignedRole === 'FRAUD_DETECTION_MANAGER') {
          t.assignedRole = 'CLAIM_MANAGER';
          updated = true;
        }
        return t;
      });
      if (updated) {
        localStorage.setItem('ins_tasks', JSON.stringify(tasksList));
      }
    } catch (e) {
      console.error('Failed to run tasks DB migration', e);
    }
  }

  if (!localStorage.getItem('ins_audit_logs')) {
    localStorage.setItem('ins_audit_logs', JSON.stringify(DEFAULT_AUDIT_LOGS));
  }

  if (!localStorage.getItem('ins_settings')) {
    localStorage.setItem('ins_settings', JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
  }
};

// Helper methods to read/write JSON
const getCollection = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setCollection = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const mockDb = {
  // Users
  getUsers: () => getCollection('ins_users'),
  saveUsers: (users) => setCollection('ins_users', users),
  
  // Claims
  getClaims: () => getCollection('ins_claims'),
  saveClaims: (claims) => setCollection('ins_claims', claims),
  
  // Tasks (Workflow Queue)
  getTasks: () => getCollection('ins_tasks'),
  saveTasks: (tasks) => setCollection('ins_tasks', tasks),
  
  // Audit Logs
  getAuditLogs: () => getCollection('ins_audit_logs'),
  saveAuditLogs: (logs) => setCollection('ins_audit_logs', logs),

  // Settings
  getSettings: () => JSON.parse(localStorage.getItem('ins_settings') || JSON.stringify(DEFAULT_SYSTEM_SETTINGS)),
  saveSettings: (settings) => localStorage.setItem('ins_settings', JSON.stringify(settings)),

  // Complex Operations
  addAuditLog: (userId, username, claimId, action, details) => {
    const logs = getCollection('ins_audit_logs');
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      userId,
      username,
      claimId,
      action,
      details
    };
    logs.unshift(newLog); // Put new logs first
    setCollection('ins_audit_logs', logs);
  },

  submitClaim: (claimData, user) => {
    const claims = getCollection('ins_claims');
    const tasks = getCollection('ins_tasks');
    const settings = mockDb.getSettings();

    // 1. Calculate mock fraud risk
    let fraudRiskScore = Math.floor(Math.random() * 30); // Base risk
    const fraudFlags = [];
    
    if (claimData.claimAmount >= settings.highValueThreshold) {
      fraudRiskScore += 40;
      fraudFlags.push('HIGH_VALUE_THRESHOLD');
    }
    if (claimData.description.toLowerCase().includes('cash') || claimData.description.toLowerCase().includes('lost')) {
      fraudRiskScore += 15;
      fraudFlags.push('KEYWORD_FLAG');
    }

    // Determine initial routing status
    let status = 'PENDING_REVIEW';
    let assignedRole = 'CLAIM_OFFICER';
    let workflowLogComment = 'Automated validation check passed. Assigned to standard processing queue.';

    if (fraudRiskScore >= settings.fraudThreshold || claimData.claimAmount >= settings.highValueThreshold) {
      status = 'FLAGGED_FOR_REVIEW';
      assignedRole = 'CLAIM_MANAGER';
      workflowLogComment = `Fraud rules triggered: Risk score is ${fraudRiskScore} (Threshold: ${settings.fraudThreshold}) or amount exceeds high-value limit. Assigned to manager escalation queue.`;
    }

    const claimId = `CLM-${Date.now().toString().slice(-4)}`;
    
    const newClaim = {
      id: claimId,
      customerId: user.id,
      customerName: user.name,
      policyNumber: claimData.policyNumber,
      claimAmount: parseFloat(claimData.claimAmount),
      lossType: claimData.lossType,
      lossDate: claimData.lossDate,
      description: claimData.description,
      status: status,
      createdAt: new Date().toISOString(),
      submittedAt: new Date().toISOString(),
      documents: claimData.documents || [],
      fraudRiskScore,
      fraudFlags,
      history: [
        { status: 'DRAFT', updatedAt: new Date().toISOString(), updatedBy: user.name, comment: 'Draft claim created.' },
        { status: 'SUBMITTED', updatedAt: new Date().toISOString(), updatedBy: user.name, comment: 'Claim submitted for processing.' },
        { status, updatedAt: new Date().toISOString(), updatedBy: 'System Engine', comment: workflowLogComment }
      ]
    };

    claims.unshift(newClaim);
    setCollection('ins_claims', claims);

    // Create a task for this claim in the workflow queue
    const taskId = `TSK-${Date.now().toString().slice(-4)}`;
    const newTask = {
      id: taskId,
      claimId: claimId,
      assignedRole,
      assignedUser: null,
      status: 'PENDING',
      title: `${claimData.lossType} Claim Review (${claimId})`,
      description: `Review claim for $${claimData.claimAmount}. Loss Type: ${claimData.lossType}. Status: ${status}.`,
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    setCollection('ins_tasks', tasks);

    // Logs
    mockDb.addAuditLog(user.id, user.username, claimId, 'CREATE_DRAFT', `Claim draft ${claimId} created.`);
    mockDb.addAuditLog(user.id, user.username, claimId, 'SUBMIT_CLAIM', `Claim ${claimId} submitted for $${claimData.claimAmount}.`);
    mockDb.addAuditLog('SYSTEM', 'System Engine', claimId, 'AUTO_VALIDATION', `Rules evaluated. Score: ${fraudRiskScore}. Action: Routed to ${assignedRole}.`);

    return newClaim;
  },

  claimTask: (taskId, user) => {
    const tasks = getCollection('ins_tasks');
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      if (tasks[taskIndex].assignedUser && tasks[taskIndex].assignedUser !== user.name) {
        throw new Error('This task is already claimed by another user.');
      }
      tasks[taskIndex].assignedUser = user.name;
      tasks[taskIndex].status = 'IN_PROGRESS';
      setCollection('ins_tasks', tasks);

      const claimId = tasks[taskIndex].claimId;
      mockDb.addAuditLog(user.id, user.username, claimId, 'CLAIM_TASK', `Task ${taskId} claimed by ${user.name}.`);

      // Update history in Claim
      const claims = getCollection('ins_claims');
      const claimIndex = claims.findIndex(c => c.id === claimId);
      if (claimIndex > -1) {
        claims[claimIndex].history.push({
          status: claims[claimIndex].status,
          updatedAt: new Date().toISOString(),
          updatedBy: user.name,
          comment: `Task locked by processor ${user.name} for review.`
        });
        setCollection('ins_claims', claims);
      }
    }
  },

  processClaim: (taskId, action, comment, user) => {
    const tasks = getCollection('ins_tasks');
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) throw new Error('Task not found.');

    const task = tasks[taskIndex];
    const claimId = task.claimId;
    const claims = getCollection('ins_claims');
    const claimIndex = claims.findIndex(c => c.id === claimId);
    if (claimIndex === -1) throw new Error('Claim not found.');

    const claim = claims[claimIndex];

    let newStatus = claim.status;
    let auditAction = '';
    let descriptionText = '';

    if (action === 'APPROVE') {
      newStatus = 'APPROVED';
      auditAction = 'APPROVE_CLAIM';
      descriptionText = `Claim approved by ${user.name}. Payout initiated. Comment: ${comment}`;
      task.status = 'COMPLETED';
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      auditAction = 'REJECT_CLAIM';
      descriptionText = `Claim rejected by ${user.name}. Comment: ${comment}`;
      task.status = 'COMPLETED';
    } else if (action === 'REQUEST_DOCS') {
      newStatus = 'PENDING_DOCUMENTATION';
      auditAction = 'REQUEST_DOCUMENTS';
      descriptionText = `Additional documents requested by ${user.name}. Reason: ${comment}`;
      // Task remains open or suspended
      task.status = 'PENDING_DOCS';
    }

    claim.status = newStatus;
    claim.history.push({
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy: user.name,
      comment: comment || `Action: ${action}`
    });

    claims[claimIndex] = claim;
    setCollection('ins_claims', claims);

    // Remove or update task
    if (task.status === 'COMPLETED') {
      tasks.splice(taskIndex, 1);
    } else {
      tasks[taskIndex] = task;
    }
    setCollection('ins_tasks', tasks);

    mockDb.addAuditLog(user.id, user.username, claimId, auditAction, descriptionText);
    return claim;
  },

  uploadDocument: (claimId, docName, category, user) => {
    const claims = getCollection('ins_claims');
    const claimIndex = claims.findIndex(c => c.id === claimId);
    if (claimIndex === -1) throw new Error('Claim not found.');

    const newDoc = {
      id: `doc-${Date.now().toString().slice(-4)}`,
      name: docName,
      category,
      size: `${(Math.random() * 2 + 0.1).toFixed(1)}MB`,
      uploadedAt: new Date().toISOString()
    };

    claims[claimIndex].documents.push(newDoc);
    
    // If the claim was waiting for docs, and the customer uploaded a document, we can notify the workflow
    if (claims[claimIndex].status === 'PENDING_DOCUMENTATION') {
      claims[claimIndex].status = 'PENDING_REVIEW';
      claims[claimIndex].history.push({
        status: 'PENDING_REVIEW',
        updatedAt: new Date().toISOString(),
        updatedBy: user.name,
        comment: `Supporting document uploaded: ${docName}. Claim returned to review queue.`
      });

      // Update task status back to PENDING
      const tasks = getCollection('ins_tasks');
      const taskIndex = tasks.findIndex(t => t.claimId === claimId);
      if (taskIndex > -1) {
        tasks[taskIndex].status = 'PENDING';
        tasks[taskIndex].description = `Review claim for $${claims[claimIndex].claimAmount}. Supporting files updated.`;
        setCollection('ins_tasks', tasks);
      }
    } else {
      claims[claimIndex].history.push({
        status: claims[claimIndex].status,
        updatedAt: new Date().toISOString(),
        updatedBy: user.name,
        comment: `New document uploaded: ${docName} (${category}).`
      });
    }

    setCollection('ins_claims', claims);
    mockDb.addAuditLog(user.id, user.username, claimId, 'UPLOAD_DOCUMENT', `Document ${docName} (${category}) uploaded.`);
    
    return claims[claimIndex];
  }
};
