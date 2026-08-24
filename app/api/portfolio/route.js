import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const apiKey = process.env.NOTION_API_KEY;

    if (!databaseId || !apiKey) {
      return NextResponse.json({ error: '환경변수가 설정되지 않았습니다.' }, { status: 500 });
    }

    const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sorts: [
          {
            property: 'Order',
            direction: 'ascending',
          },
        ],
      }),
      // 항상 최신 데이터를 가져오도록 설정
      cache: 'no-store' 
    });

    if (!res.ok) {
      throw new Error('Notion API 통신 실패');
    }

    const data = await res.json();

    const results = data.results.map((page) => {
      // 노션 속성 이름이 '이름', 'Title', 'title' 중 무엇이든 호환되게 처리
      const title = page.properties.이름?.title[0]?.plain_text || 
                    page.properties.Title?.title[0]?.plain_text || 
                    page.properties.title?.title[0]?.plain_text || 'Untitled';
      
      let imageUrl = '';
      const urlProp = page.properties.URL?.url || page.properties.URL?.rich_text?.[0]?.plain_text;
      if (urlProp) {
        imageUrl = urlProp;
      } else if (page.properties.imageUrl?.files?.[0]) {
        const fileObj = page.properties.imageUrl.files[0];
        imageUrl = fileObj.file?.url || fileObj.external?.url;
      }

      let subImages = '';
      const subProp = page.properties.SubImages?.rich_text?.[0]?.plain_text || page.properties.SubImages?.url;
      if (subProp) {
        subImages = subProp;
      }

      return {
        id: page.id,
        title,
        imageUrl,
        subImages,
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
