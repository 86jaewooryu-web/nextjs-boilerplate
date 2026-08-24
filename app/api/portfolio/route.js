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

    const portfolios = data.results.map(page => {
      const title = page.properties.Title?.title[0]?.plain_text || 'Untitled';
      const imageFile = page.properties.Image?.files[0];
      const imageUrl = imageFile?.file?.url || imageFile?.external?.url || '';
      
      return { title, imageUrl };
    });

    return NextResponse.json(portfolios);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
