const dashboard = {
  metrics: {
    onTimeRepaymentRate: 82,
    fullRepaymentRate: 74,
    educationCompletionRate: 68,
  },
  topParishes: [
    { parishName: 'Kiboga Central', households: 134, repaymentRate: 91 },
    { parishName: 'Nakasozi', households: 102, repaymentRate: 87 },
    { parishName: 'Bukunja', households: 88, repaymentRate: 84 },
  ],
}

const repayments = [
  {
    providerTransactionId: 'WENDI-000921',
    beneficiaryPhone: '+256701000111',
    amount: 120000,
    status: 'success',
    transactionTime: '2026-04-20T08:16:00.000Z',
  },
  {
    providerTransactionId: 'WENDI-000922',
    beneficiaryPhone: '+256702000222',
    amount: 95000,
    status: 'success',
    transactionTime: '2026-04-20T09:10:00.000Z',
  },
]

const educationModules = [
  {
    code: 'REPAY-101',
    title: 'Why Full Repayment Unlocks More Capital',
    languageCode: 'en',
    channelType: 'sms',
    summary: 'Build trust with SACCOs and qualify faster for next-cycle loans.',
    contentUri: null,
    estimatedMinutes: 8,
    videoUrl: 'https://www.youtube.com/watch?v=9No-FiEInLA',
    textContent:
      'Repayment is your pathway to bigger capital. Keep records of each payment, track due dates, and share progress with your SACCO group leaders.',
    defaultFormat: 'video',
    estimatedMinutesVideo: 8,
    estimatedMinutesText: 4,
  },
  {
    code: 'SAVE-201',
    title: 'Daily Record Keeping for Small Enterprises',
    languageCode: 'lg',
    channelType: 'ussd',
    summary: 'Track expenses and sales to avoid cash flow shocks.',
    contentUri: null,
    estimatedMinutes: 5,
    videoUrl: null,
    textContent:
      'Write down all your daily sales and expenses in one notebook. At week end, compare totals and plan next week buying carefully.',
    defaultFormat: 'text',
    estimatedMinutesVideo: null,
    estimatedMinutesText: 5,
  },
]

module.exports = { dashboard, repayments, educationModules }
