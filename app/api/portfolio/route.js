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

    // 데이터가 없거나 결과가 없으면 빈 배열 반환
    if (!data.results || !Array.isArray(data.results)) {
      return NextResponse.json([]);
    }

    // 각 페이지의 첫 번째 속성값을 무조건 타이틀로 가져오기 (에러 방지)
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

    return NextResponse.json(portfolios);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
