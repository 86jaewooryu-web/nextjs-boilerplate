import { NextResponse } from 'next/server';

// 1. 보안 검사(Preflight)를 통과시켜주는 OPTIONS 함수 추가
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // 모든 외부 홈페이지(카페24 등) 접근 허용
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// 2. 실제 노션 데이터를 가져오는 GET 함수
export async function GET() {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const apiKey = process.env.NOTION_API_KEY;

    if (!databaseId || !apiKey) {
      return NextResponse.json(
        { error: '환경변수가 설정되지 않았습니다.' }, 
        { status: 500, headers: corsHeaders }
      );
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
      next: { revalidate: 0 } 
    });

    if (!res.ok) {
      throw new Error('Notion API 통신 실패');
    }

    const data = await res.json();

    const results = data.results.map((page) => {
      const title = page.properties.title?.title[0]?.plain_text || 'Untitled';
      
      let imageUrl = '';
      if (page.properties.URL?.type === 'files' && page.properties.URL.files[0]) {
        imageUrl = page.properties.URL.files[0].file?.url || page.properties.URL.files[0].external?.url || '';
      }
      
      let subImages = '';
      if (page.properties.SubImages?.type === 'files' && page.properties.SubImages.files[0]) {
        subImages = page.properties.SubImages.files[0].file?.url || page.properties.SubImages.files[0].external?.url || '';
      }

      return {
        id: page.id,
        title,
        imageUrl,
        subImages,
      };
    });

    // 성공 시에도 출입증(CORS 헤더)을 동봉하여 카페24로 전송
    return NextResponse.json(results, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
