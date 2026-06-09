export const roles = {
  guest: 'guest',
  member: 'member',
  freelancer: 'freelancer',
  client: 'client',
  admin: 'admin',
}

export const dashboardByRole = {
  member: '/member/dashboard',
  freelancer: '/freelancer/dashboard',
  client: '/client/dashboard',
  admin: '/admin/dashboard',
}

export const roleLabels = {
  guest: 'Guest',
  member: 'Member',
  freelancer: 'Freelancer',
  client: 'Client',
  admin: 'Administrator',
}

export function getDashboardPath(role) {
  return dashboardByRole[role] || '/member/dashboard'
}

export function canPostJob(role) {
  return ['client', 'admin'].includes(role)
}

export function canBuildTalentProfile(role) {
  return ['member', 'freelancer', 'admin'].includes(role)
}

export function canCreateJobApplication(role) {
  return ['member', 'freelancer', 'admin'].includes(role)
}

export function canCreateTalentInvite(role) {
  return ['client', 'admin'].includes(role)
}

export function isAdmin(role) {
  return role === 'admin'
}
