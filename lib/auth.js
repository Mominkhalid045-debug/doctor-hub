import { getUserFromRequest } from './jwt'
import { NextResponse } from 'next/server'

export function requireAuth(request, allowedRoles = []) {
  const user = getUserFromRequest(request)
  
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), user: null }
  }
  
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }), user: null }
  }
  
  return { error: null, user }
}

export function successResponse(data, status = 200) {
  return NextResponse.json({ success: true, data }, { status })
}

export function errorResponse(message, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status })
}
