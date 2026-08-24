import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
      // Order 숫자를 기준으로 오름차순(ascending) 정렬 추가
      sorts: [
        {
          property: 'Order',
          direction: 'ascending',
        },
      ],
    });

    const data = response.results.map((page) => {
      // 타이틀 추출
      const title = page.properties.title?.title[0]?.plain_text || 'Untitled';
      
      // 이미지 URL 추출 (기존 imageUrl 또는 URL 속성)
      let imageUrl = '';
      const urlProp = page.properties.URL?.url || page.properties.URL?.rich_text?.[0]?.plain_text;
      if (urlProp) {
        imageUrl = urlProp;
      } else if (page.properties.imageUrl?.files?.[0]) {
        const fileObj = page.properties.imageUrl.files[0];
        imageUrl = fileObj.file?.url || fileObj.external?.url;
      }

      // 서브 이미지 추출 (subImages 속성)
      let subImages = '';
      const subProp = page.properties.SubImages?.rich_text?.[0]?.plain_text || page.properties.subImages?.url;
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

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
