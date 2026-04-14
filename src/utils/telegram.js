// Gestione integrazione Telegram WebApp

export const initTelegram = () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.ready()
    window.Telegram.WebApp.expand()
    
    // Tema colori Telegram
    const theme = window.Telegram.WebApp.themeParams
    document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color)
    document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color)
  }
}

export const getTelegramUser = () => {
  if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
    return window.Telegram.WebApp.initDataUnsafe.user
  }
  return null
}

export const getTelegramInitData = () => {
  if (window.Telegram?.WebApp?.initData) {
    return window.Telegram.WebApp.initData
  }
  return null
}

export const closeWebApp = () => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.close()
  }
}

export const showAlert = (message) => {
  if (window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message)
  } else {
    alert(message)
  }
}
