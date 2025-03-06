import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const botToken = process.env.BOT_TOKEN;

    if (!botToken) {
        return NextResponse.json({ error: 'توکن روبات مشخص نشده است' }, { status: 500 });
    }

    const { telegramId, channelUsername } = await req.json();

    if (!telegramId || !channelUsername) {
        return NextResponse.json({ error: 'درخواست نامعتبر: یوزرنیم کاربر یا کانال مشخص نشده است' }, { status: 400 });
    }

    try {
        let formattedChatId = channelUsername;
        if (!channelUsername.startsWith('@') && !channelUsername.startsWith('-100')) {
            formattedChatId = '@' + channelUsername;
        }

        const url = `https://api.telegram.org/bot${botToken}/getChatMember?chat_id=${encodeURIComponent(formattedChatId)}&user_id=${telegramId}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('خطا در ای پی آی تلگرام:', response.status, errorText);
            return NextResponse.json({ error: `خطا در ای پی آی تلگرام: ${response.status} ${errorText}` }, { status: 500 });
        }

        const data = await response.json();

        if (data.ok) {
            const status = data.result.status;
            const isMember = ['creator', 'administrator', 'member'].includes(status);
            return NextResponse.json({ isMember });
        } else {
            return NextResponse.json({ error: ` پاسخ فالس برای ای پی آی تلگرام: ${JSON.stringify(data)}` }, { status: 500 });
        }
    } catch (error) {
        console.error('خطا در بررسی عضویت:', error);
        if (error instanceof Error) {
            return NextResponse.json({ error: `ناموفق در بررسی عضویت: ${error.message}` }, { status: 500 });
        }
        return NextResponse.json({ error: 'خطایی ناشناخته در زمان بررسی عصویت اتفاق افتاد' }, { status: 500 });
    }
}