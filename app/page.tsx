'use client'

import { useState, useEffect } from 'react'
import myImageExternalLink from './external-link.png'
import myImageBot from './bot.png'
import Image from 'next/image'

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
  const [channelUsername, setChannelUsername] = useState('@taraah_net')
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
        <Image src={myImageBot} alt="bot" className="mb-4" width={100} height={100} />
        <h1 className="text-4xl font-bold mb-8"> هیات نجات غریق و غواصی استان مرکزی
        </h1>
        <p className="text-xl">این ربات برای استفاده به عنوان مینی اپ تلگرامی طراحی شده است</p>
      </main>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 light:bg-gray-100 dark:bg-gray-800">
      <Image src={myImageBot} alt="bot" className="mb-4 " width={100} height={100} />
      <h1 className="text-2xl font-bold mb-4 mx-auto light:text-gray-800 dark:text-gray-100 ">برای عضویت در گروه های تخفیفی ویژه نجات غریقان و غواصان استان مرکزی ابتدا در کانال رسمی عضو شوید</h1>
      <p/>
      <a href='https://t.me/taraah_net' className='light:text-gray-800 dark:text-gray-100'>@markazilifesaving 
      <span className="inline-flex items-baseline">
      <Image src={myImageExternalLink} alt="link" className="mx-1 size-7 self-center" />
      </span>
      </a>

      <br/>
      <p className="text-xl light:text-gray-800 dark:text-gray-100">پس از عضویت دکمه بررسی را بزنید</p>
      <br/>
      <button
        onClick={checkChannelMembership}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
        disabled={isLoading || !channelUsername}
      >
        {isLoading ? 'در حال بررسی...' : 'بررسی عضویت'}
      </button>
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {isChannelMember !== null && !isLoading && (
        <p className="mt-4 text-xl light:text-gray-800 dark:text-gray-100 items-center justify-center">
          {isChannelMember
            ? "شما عضو کانال هستید"
            : "شما عضو کانال نیستید، پس از عضویت دوباره تلاش کنید "}
        </p>
      )}
    </main>
  )
}