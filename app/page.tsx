'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: any
    }
  }
}

export default function Home() {
  const [isChannelMember, setIsChannelMember] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [telegramId, setTelegramId] = useState<string | null>(null)
  const [channelUsername, setChannelUsername] = useState('@markazilifesaving')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const initDataString = window.Telegram.WebApp.initData;
      if (initDataString) {
        const urlParams = new URLSearchParams(initDataString);
        try {
          const user = JSON.parse(urlParams.get('user') || '{}');
          if (user.id) {
            setTelegramId(user.id.toString());
          }
        } catch (error) {
          console.error('خطا در دریافت اطلاعات کاربر:', error);
        }
      }
    }
  }, [])

  const checkChannelMembership = async () => {
    if (!telegramId) {
      alert('این مینی اپ فقط در تلگرام قابلیت اجرا دارد')
      return
    }

    if (!channelUsername) {
      alert('لطفا یوزرنیم کانال را وارد کنید')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/check-membership', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegramId,
          channelUsername,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'بررسی عضویت در کانال با خطا مواجه شد')
      }

      const data = await response.json()
      setIsChannelMember(data.isMember)
      setError(null)
    } catch (error) {
      console.error('خطا در بررسی عضویت در کانال:', error)
      setIsChannelMember(false)
      setError(error instanceof Error ? error.message : 'خطایی با دلیل نامشخص رخ داد')
    } finally {
      setIsLoading(false)
    }
  }

  if (!telegramId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-4xl font-bold mb-8">بررسی عضویت در کانال تلگرامی هیات نجات غریق و غواصی استان مرکزی
        </h1>
        <p className="text-xl">این روبات فقط قابلیت استفاده به عنوان مینی اپ تلگرامی را دارد</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8">بررسی عضویت در کانال</h1>
      <input disabled type="text" value={channelUsername}
        onChange={(e) => setChannelUsername(e.target.value)}
        placeholder="یوزرنیم کانال (مثال: @example)"
        className="mb-4 p-2 border border-gray-300 rounded w-full max-w-xs"
      />
      <button
        onClick={checkChannelMembership}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        disabled={isLoading || !channelUsername}
      >
        {isLoading ? 'در حال بررسی...' : 'بررسی عضویت'}
      </button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {isChannelMember !== null && !isLoading && (
        <p className="mt-4 text-xl">
          {isChannelMember
            ? "شما عضو کانال هستید"
            : "شما عضو کانال نیستید"}
        </p>
      )}
    </main>
  )
}