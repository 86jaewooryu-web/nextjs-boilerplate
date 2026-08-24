import { NextResponse } from 'next/server';

export async function GET() {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;

  try {
    const notionRes = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    if (!notionRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch from Notion', status: notionRes.status }, { status: 500 });
    }

    const data = await notionRes.json();

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json([], { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const portfolios = data.results.map(page => {
      const props = page.properties || {};
      
      let title = 'Untitled';
      let imageUrl = '';

      for (const key of Object.keys(props)) {
        const prop = props[key];
        if (prop.type === 'title' && prop.title?.[0]) {
          title = prop.title[0].plain_text;
        }
        if (prop.type === 'files' && prop.files?.[0]) {
          imageUrl = prop.files[0].file?.url || prop.files[0].external?.url || '';
        }
      }

      if (title === 'Untitled' && Object.keys(props).length > 0) {
        const firstProp = props[Object.keys(props)[0]];
        if (firstProp?.rich_text?.[0]) {
          title = firstProp.rich_text[0].plain_text;
        }
      }

      return { title, imageUrl };
    });

    return NextResponse.json(portfolios, { headers: { 'Access-Control-Allow-Origin': '*' } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
