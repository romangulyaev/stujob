// app/lib/debug.ts
export function logAuthState(component: string, data: any) {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${component}]`, {
        ...data,
        time: new Date().toISOString(),
        localStorage: localStorage.getItem('stujob_user_backup')
      })
    }
  }