import { NextResponse } from 'next/server';

export async function GET() {
  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const DATABASE_ID = process.env.NOTION_DATABASE_ID;

  try {
    const response = `https://api.notion.com/v1/databases/${DATABASE_ID}/query`;
    const notionRes = await fetch(response, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-02-28',
        'Content-Type': 'application/json',
      },
    });

    const data = await notionRes.json();

    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json([], { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const portfolios = data.results.map(page => {
      const props = page.properties || {};
      
      // 어떤 이름의 열이든 첫 번째와 두 번째 속성값을 무조건 타이틀과 이미지로 가져오기
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

      // 만약 타이틀을 못 찾았으면 첫 번째 텍스트 값이라도 가져오기
      if (title === 'Untitled' && Object.keys(props).length > 0) {
        const firstProp = props[Object.keys(props)[0]];
        if (firstProp?.rich_text?.[0]) {
          title = firstProp.rich_text[0].plain_text;
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
