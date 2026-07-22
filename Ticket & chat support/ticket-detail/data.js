/* =============================================================
   TICKET DETAIL — Mock data + helpers
   Exposed as window.TICKET_DETAIL_DATA.
   ============================================================= */
(function (root) {
  'use strict';

  /* Default ticket details per category (sensible fallback
     when a row in the tickets table doesn't carry all fields). */
  const DEFAULT_DETAILS = {
    organization: 'Harmony Multispecialty Clinic',
    provider: 'Anderson, Robert',
    assignTo: 'mt-test',
    category: 'Encounter',
    timeline: [
      {
        icon: 'fa-pen-to-square',
        iconClass: 'blue',
        title: 'Ticket Created',
        date: 'May 20, 2025',
        time: '10:30 AM'
      },
      {
        icon: 'fa-circle-exclamation',
        iconClass: 'orange',
        title: 'Status: Pending',
        date: 'May 20, 2025',
        time: '10:30 AM'
      }
    ],
    attachments: [
      { id: 'att1', name: 'change.color.png', size: '84 KB', type: 'PNG' }
    ]
  };

  /* Override / extend per ticket id when we know specifics. */
  const TICKET_DETAILS = {
    'TK-12489': {
      description: 'Provider is unable to access patient documents in the Documents tab. The page loads but the list is empty even though the documents exist in the EHR.',
      resolveNote: 'Verified with the EHR team — sync was paused. Triggered a manual re-sync and confirmed all 12 documents are now visible. Closing the ticket.',
      note: 'Called the provider at 11:05 AM, walked through the Documents tab, and confirmed the issue reproduces on the latest Chrome build.'
    },
    'TK-12488': {
      description: 'After clicking "Save Note" the editor shows a success toast, but when the encounter is reopened the new content is gone. Local draft also disappears.',
      resolveNote: '',
      note: 'Reproduced on the provider\'s account. Logs show the save request 200s but the local IndexedDB transaction is rolled back. Re-opened as a P1 bug for the encounter squad.'
    },
    'TK-12475': {
      description: 'EHR sync is failing with the message "connection timed out" for every patient opened since 8:30 AM. The status indicator stays red.',
      resolveNote: '',
      note: 'Network team confirms the EHR endpoint is healthy from their side. Escalating to the integration squad for further trace.'
    },
    'TK-12463': {
      description: 'Coding suggestions for encounter SUP-225 are returning a low-confidence E/M code that doesn\'t match the documentation complexity.',
      resolveNote: 'Tuned the coding model threshold for the provider and the suggested E/M level now matches documentation. Verified across 5 recent encounters.',
      note: 'Reviewed 10 random encounters from the past week. The over-suggestion only happens for encounters > 30 minutes; tuned the model accordingly.'
    },
    'TK-12450': {
      description: 'Requesting the ability to mark templates as favorites and pin them to the top of the template picker in the encounter editor.',
      resolveNote: '',
      note: 'Forwarded to the Product team for the Q3 roadmap review. Will follow up after the prioritization meeting on Friday.'
    }
  };

  /* Derive a priority/status color/label helper. */
  function statusMeta(status) {
    const map = {
      'open':         { label: 'Open',                className: 'td-badge-blue' },
      'in-progress':  { label: 'In Progress',         className: 'td-badge-orange' },
      'awaiting':     { label: 'Awaiting Response',   className: 'td-badge-yellow' },
      'resolved':     { label: 'Resolved',            className: 'td-badge-green' },
      'pending':      { label: 'Pending',             className: 'td-badge-yellow' }
    };
    return map[status] || { label: status || 'Open', className: 'td-badge-blue' };
  }

  function priorityMeta(priority) {
    const map = {
      'high':   { label: 'High',   className: 'td-prio-high' },
      'medium': { label: 'Medium', className: 'td-prio-medium' },
      'low':    { label: 'Low',    className: 'td-prio-low' }
    };
    return map[priority] || { label: priority || 'Low', className: 'td-prio-low' };
  }

  function getTicketDetail(ticket) {
    if (!ticket) return null;
    const override = TICKET_DETAILS[ticket.id] || {};
    const fallback = DEFAULT_DETAILS;
    return {
      id: ticket.id,
      subject: ticket.subject || 'Untitled Ticket',
      category: ticket.category || fallback.category,
      organization: fallback.organization,
      provider: ticket.provider || (ticket.assignee ? ticket.assignee : fallback.provider),
      ticketNo: ticket.id,
      assignTo: ticket.assignee || fallback.assignTo,
      status: statusMeta(ticket.status),
      categoryLabel: ticket.category || fallback.category,
      priority: priorityMeta(ticket.priority),
      createdDate: ticket.date || 'May 20, 2025',
      createdTime: ticket.time || '10:30 AM',
      title: ticket.subject || 'Encounter Status Not Updating',
      description: override.description || 'No additional details have been provided for this ticket yet.',
      resolveNote: override.resolveNote || '-',
      note: override.note || '-',
      attachments: fallback.attachments,
      timeline: fallback.timeline
    };
  }

  const TICKET_DETAIL_DATA = {
    getTicketDetail,
    statusMeta,
    priorityMeta,
    DEFAULT_DETAILS,
    TICKET_DETAILS
  };

  if (typeof window !== 'undefined') {
    root.TICKET_DETAIL_DATA = TICKET_DETAIL_DATA;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TICKET_DETAIL_DATA;
  }
})(typeof window !== 'undefined' ? window : globalThis);
