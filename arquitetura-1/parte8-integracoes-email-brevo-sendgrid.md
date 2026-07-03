// lib/email.ts
export async function sendQuizCompletionEmail(user, profile, token) {
  const templateId = profiles[profile.id].email_templates.quiz_completion

  await brevo.contactsApi.createContact({
    email: user.email,
    attributes: {
      FIRST_NAME: user.name || 'Leitor',
      PROFILE_ID: profile.id,
      TOKEN: token,
      QUIZ_COMPLETED: new Date().toISOString()
    }
  })

  // Envia email de template
  await brevo.transactionalEmailsApi.sendTransacEmail({
    templateId,
    to: [{ email: user.email }],
    params: {
      profileName: profile.name,
      freeEbook2Title: getFreeEbookForProfile(profile.id).title,
      dashboardUrl: `${process.env.NEXT_PUBLIC_URL}/dashboard/${token}`
    }
  })

  // Entra em automation: "Quiz Completion Sequence"
  // Isto dispara emails automáticos nos dias 3, 7, 14, 21
}