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
      return NextResponse.json([], { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const portfolios = data.results.map(page => {
      const props = page.properties || {};
      let title = 'Untitled';
      let imageUrl = '';

      for (const key of Object.keys(props)) {
        const prop = props[key];
        if (prop.type === 'title' && prop.title && prop.title[0]) {
          title = prop.title[0].plain_text;
        }
        if (prop.type === 'files' && prop.files && prop.files[0]) {
          imageUrl = prop.files[0].file?.url || prop.files[0].external?.url || '';
        }
      }

      return { title, imageUrl };
    });

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
