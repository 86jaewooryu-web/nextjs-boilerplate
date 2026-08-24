import { Client } from '@notionhq/client';
import { NextResponse } from 'next/server';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID,
    });

    const data = response.results.map((page) => {
      // 타이틀 추출
      const title = page.properties.title?.title[0]?.plain_text || 'Untitled';
      
      // 이미지 URL 추출 (URL 속성 또는 imageUrl 속성 지원)
      let imageUrl = '';
      const urlProp = page.properties.URL?.url || page.properties.URL?.rich_text?.[0]?.plain_text;
      if (urlProp) {
        imageUrl = urlProp;
      } else if (page.properties.imageUrl?.files?.[0]) {
        const fileObj = page.properties.imageUrl.files[0];
        imageUrl = fileObj.file?.url || fileObj.external?.url;
      }

      // 서브 이미지 추출 (SubImages 속성)
      let subImages = '';
      const subProp = page.properties.SubImages?.rich_text?.[0]?.plain_text || page.properties.SubImages?.url;
      if (subProp) {
        subImages = subProp;
      }

      // Order 숫자 가져오기 (정렬용)
      const orderNum = page.properties.Order?.number || 0;

      return {
        id: page.id,
        title,
        imageUrl,
        subImages,
        orderNum,
      };
    });

    // 자바스크립트 자체에서 Order 숫자를 기준으로 안전하게 오름차순 정렬
    data.sort((a, b) => a.orderNum - b.orderNum);

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch data', details: error.message }, { status: 500 });
  }
}
