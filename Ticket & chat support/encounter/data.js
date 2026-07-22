/* =============================================================
   ENCOUNTER — Mock data + helpers
   Local JSON-shaped data. No backend / no API.
   Exposed as window.ENCOUNTER_DATA for the encounter module.
   ============================================================= */
(function (root) {
  'use strict';

  /* =========================
     Default snippets
  ========================= */
  const DEFAULT_SNIPPETS = [
    { id: 'sn1', name: 'Visit_2026-05-13_part1.mp3', duration: '02:18', size: '1.4 MB', format: 'mp3' },
    { id: 'sn2', name: 'Visit_2026-05-13_part2.wav', duration: '01:42', size: '2.1 MB', format: 'wav' },
    { id: 'sn3', name: 'Physical_exam.m4a',           duration: '00:54', size: '0.8 MB', format: 'm4a' }
  ];

  /* =========================
     Clinical templates
     Each value is a { sectionName: prefill } map
  ========================= */
  const TEMPLATES = {
    'nwp-gi': {
      'Assessment / Differential Diagnosis':
        '<ol>' +
          '<li>Primary noninfective gastroenteritis/colitis unspecified, K52.831</li>' +
          '<li>IBS exacerbation</li>' +
          '<li>Dietary intolerance</li>' +
          '<li>Medication or probiotic-related GI effects</li>' +
          '<li>Less likely early inflammatory bowel flare, given family history of IBD</li>' +
        '</ol>',
      'Plan':
        '<ul>' +
          '<li><strong>Dietary modifications:</strong><br>Avoid dairy for 2–3 weeks, monitor symptoms, consider a low FODMAP diet trial.</li>' +
          '<li><strong>Hydration:</strong><br>Increase oral fluids, especially electrolyte-rich solutions.</li>' +
          '<li><strong>Symptomatic relief:</strong><br>Antiemetic as needed for nausea; consider loperamide for diarrhea if not contraindicated.</li>' +
          '<li><strong>Follow-up:</strong><br>Return in 1–2 weeks if symptoms persist or worsen; sooner if fever, blood in stool, or severe abdominal pain develops.</li>' +
          '<li><strong>Referral:</strong><br>GI consult if symptoms do not improve with conservative measures within 3–4 weeks.</li>' +
        '</ul>'
    },
    'SOAP': {
      'Subjective': 'Patient reports dull right-sided abdominal pain for the past 3 days, with associated morning nausea. No fever, vomiting, or recent dietary changes. Pain is dull at rest, sharp with movement.',
      'Objective':   'Vital signs stable. Afebrile. Abdomen: mild tenderness in RLQ on palpation. No rebound tenderness. Bowel sounds present. No guarding.',
      'Assessment':  'Right lower quadrant pain, differential includes appendicitis, ovarian pathology, or musculoskeletal strain.',
      'Plan':        'Order CBC, CMP, and abdominal ultrasound. Patient to return in 2-3 days for follow-up. Symptomatic care with hydration. Return precautions discussed.'
    },
    'GI Consultation': {
      'Chief Complaint':           'Right-sided abdominal pain for 3 days',
      'History of Present Illness': '52-year-old male with 3-day history of dull right lower quadrant pain with associated morning nausea. No fever, vomiting, or dietary changes. Pain is dull at rest, sharp with movement.',
      'Past Medical History':       'Hypertension, hyperlipidemia. No prior abdominal surgeries.',
      'Review of Systems':          'GI: nausea, no vomiting, no diarrhea. Constitutional: denies fever. MSK: no joint pain.',
      'Assessment':                 'Suspected appendicitis vs. alternative GI pathology.',
      'Plan':                       'CBC, CMP, abdominal ultrasound. GI consult if ultrasound inconclusive. Follow-up in 2-3 days.'
    },
    'Cardiology': {
      'Chief Complaint':           'Right-sided abdominal pain',
      'History of Present Illness': '52-year-old male with cardiovascular risk factors (HTN, HLD) presenting with 3-day RLQ pain.',
      'Cardiac History':            'No known CAD. No prior MI. No arrhythmias.',
      'Medication':                 'Lisinopril 10 mg daily, Atorvastatin 40 mg daily.',
      'Assessment':                 'Cardiac etiology unlikely given focal RLQ presentation.',
      'Plan':                       'EKG to rule out referred cardiac pain. Continue current cardiac medications. Follow up as needed.'
    },
    'Orthopedic': {
      'Chief Complaint':           'Right-sided abdominal pain x 3 days',
      'History of Present Illness': '52-year-old male, 3-day history of RLQ pain worse with movement.',
      'Past Medical History':       'Hypertension, hyperlipidemia.',
      'Review of Systems':          'MSK: denies joint pain or recent trauma.',
      'Assessment':                 'Musculoskeletal strain less likely given lack of trauma.',
      'Plan':                       'Imaging as indicated. Conservative management if MSK etiology confirmed.'
    },
    'ENT': {
      'Chief Complaint':           'Right-sided abdominal pain',
      'History of Present Illness': '52-year-old male, 3-day RLQ pain, no ENT symptoms.',
      'ENT History':                'No recent URI, no ear pain, no sore throat.',
      'Physical Exam':              'ENT exam unremarkable.',
      'Assessment':                 'ENT etiology ruled out.',
      'Plan':                       'Continue abdominal workup.'
    },
    'Neurology': {
      'Chief Complaint':           'Right-sided abdominal pain',
      'History of Present Illness': '52-year-old male with 3-day RLQ pain, no neurological symptoms.',
      'Neurological Exam':          'No focal deficits.',
      'Assessment':                 'Neurological etiology unlikely.',
      'Plan':                       'Continue abdominal workup.'
    },
    'General Medicine': {
      'Chief Complaint':           'Right-sided abdominal pain x 3 days',
      'History of Present Illness': '52-year-old male, 3-day history of dull RLQ pain with associated nausea.',
      'Past Medical History':       'HTN, HLD',
      'Medications':                'Lisinopril, Atorvastatin',
      'Allergies':                  'NKDA',
      'Physical Exam':              'Vitals stable. Abdomen: RLQ tenderness, no rebound.',
      'Assessment':                 'RLQ pain, working up.',
      'Plan':                       'Labs and imaging. Follow-up in 2-3 days.'
    }
  };

  /* =========================
     Patient documents
  ========================= */
  const DOCUMENTS = [
    { id: 'doc1', name: 'CBC Results',           type: 'Lab Results',        date: '2026-05-10', format: 'PDF' },
    { id: 'doc2', name: 'Lipid Panel',           type: 'Lab Results',        date: '2026-04-15', format: 'PDF' },
    { id: 'doc3', name: 'Lisinopril Rx',         type: 'Prescription',       date: '2026-04-15', format: 'PDF' },
    { id: 'doc4', name: 'Previous Visit Note',   type: 'Previous Encounter', date: '2026-03-20', format: 'PDF' },
    { id: 'doc5', name: 'Abdominal X-Ray',       type: 'Imaging Reports',    date: '2026-02-10', format: 'PDF' }
  ];

  /* =========================
     AI suggestions — ICD codes
  ========================= */
  const ICD_CODES = [
    { code: 'R10.31',  description: 'Right lower quadrant pain',       confidence: 92, status: 'pending' },
    { code: 'K35.80',  description: 'Unspecified acute appendicitis',  confidence: 78, status: 'pending' },
    { code: 'R11.0',   description: 'Nausea',                           confidence: 85, status: 'pending' },
    { code: 'R10.83',  description: 'Colic',                             confidence: 45, status: 'pending' }
  ];

  /* =========================
     Missing elements
  ========================= */
  const MISSING_ELEMENTS = [
    'No documented review of medications',
    'No family history documented',
    'Vital signs not yet recorded',
    'Allergy status needs confirmation'
  ];

  /* =========================
     Helpers
  ========================= */
  function buildPatient(appointment) {
    /* Appointment shape (from dashboard):
         { patientName, age, gender, visitType, appointmentDate, appointmentTime } */
    if (!appointment) return null;
    return {
      id: 'p_' + (appointment.id || Math.random()),
      name: appointment.patientName || 'Patient',
      age: appointment.age || 45,
      gender: appointment.gender || 'M',
      year: new Date(appointment.appointmentDate || Date.now()).getFullYear(),
      insurance: 'Blue Cross Blue Shield',
      mrn: 'MRN-' + (4500 + (appointment.id || 0)),
      encounterDate: appointment.appointmentDate || '2026-05-13',
      encounterTime: appointment.appointmentTime || '9:00 AM',
      visitType: appointment.visitType || 'Office Visit',
      provider: 'Dr. James Anderson',
      location: 'North Clinic',
      visitId: 'APT-' + (2000 + (appointment.id || 0))
    };
  }

  function getTranscript(patient) {
    const name = (patient && patient.name) || 'the patient';
    return [
      { speaker: 'Doctor',  text: `Good morning ${name}, how are you feeling today?` },
      { speaker: 'Patient', text: "I've been having some abdominal pain on the right side for the past three days." },
      { speaker: 'Doctor',  text: "Can you describe the pain? Is it sharp, dull, or throbbing?" },
      { speaker: 'Patient', text: "It's more of a dull ache, but it gets sharp when I move certain ways." },
      { speaker: 'Doctor',  text: "Any nausea, vomiting, or fever?" },
      { speaker: 'Patient', text: "A little nausea, especially in the mornings. No fever that I've noticed." },
      { speaker: 'Doctor',  text: "Have you eaten anything unusual recently?" },
      { speaker: 'Patient', text: "Not that I can think of. I've been eating normally." },
      { speaker: 'Doctor',  text: "Let me examine you. Take a deep breath… Any tenderness here?" },
      { speaker: 'Patient', text: "Yes, that's the spot." },
      { speaker: 'Doctor',  text: "I think we should run some tests to rule out appendicitis. Let me order a complete blood count and an abdominal ultrasound." },
      { speaker: 'Patient', text: "Okay, doctor. Should I be worried?" },
      { speaker: 'Doctor',  text: "Let's not jump to conclusions. The tests will give us a clearer picture. I'll see you back in a couple of days." }
    ];
  }

  function getDocumentCompleteness(patient) {
    /* Random-ish stable value per patient id */
    const seed = (patient && patient.id) ? patient.id.length : 8;
    return 65 + (seed * 3) % 30; // 65–94
  }

  function getMedicalNecessity(patient) {
    const seed = (patient && patient.id) ? patient.id.length : 5;
    return 80 + (seed * 2) % 18; // 80–97
  }

  function getMacros() {
    return [
      { name: 'Normal exam',                body: 'Physical exam within normal limits.' },
      { name: 'Follow-up in 2 weeks',       body: 'Patient to follow up in 2 weeks, sooner if symptoms worsen.' },
      { name: 'Labs ordered',                body: 'CBC, CMP, and appropriate imaging ordered today.' },
      { name: 'Return precautions',         body: 'Return immediately for fever > 101°F, worsening pain, vomiting, or any concerning change.' }
    ];
  }

  function getSmartNotes() {
    return [
      { title: 'HPI template', preview: 'Patient is a [age]-year-old [gender] presenting with…' },
      { title: 'ROS checklist', preview: 'Constitutional, HEENT, Cardiovascular, Respiratory, GI…' },
      { title: 'Assessment phrases', preview: 'Differential includes, working diagnosis, rule out…' },
      { title: 'Plan templates', preview: 'Labs, imaging, follow-up, return precautions…' }
    ];
  }

  /* =========================
     Public API
  ========================= */
  const ENCOUNTER_DATA = {
    snippets: DEFAULT_SNIPPETS,
    templates: TEMPLATES,
    documents: DOCUMENTS,
    icdCodes: ICD_CODES,
    missingElements: MISSING_ELEMENTS,
    buildPatient,
    getTranscript,
    getDocumentCompleteness,
    getMedicalNecessity,
    getMacros,
    getSmartNotes
  };

  if (typeof window !== 'undefined') {
    root.ENCOUNTER_DATA = ENCOUNTER_DATA;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ENCOUNTER_DATA;
  }
})(typeof window !== 'undefined' ? window : globalThis);
