import { NextResponse } from 'next/server';

export async function GET() {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-02-28',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json([], {
        headers: { 'Access-Control-Allow-Origin': '*' }
      });
    }

    const portfolios = data.results.map(page => {
      const props = page.properties || {};
      const firstPropKey = Object.keys(props)[0];
      const titleProp = firstPropKey ? props[firstPropKey] : null;
      
      let title = 'Untitled';
      if (titleProp && titleProp.title && titleProp.title[0]) {
        title = titleProp.title[0].plain_text;
      }

      return { title, imageUrl: '' };
    });

    // CORS 허용 헤더를 포함하여 응답 반환
    return NextResponse.json(portfolios, {
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { 
      status: 500,
      headers: { 'Access-Control-Allow-Origin': '*' }
    });
  }
}
