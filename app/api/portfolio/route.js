import { NextResponse } from 'next/server';

// 1. 보안 검사(Preflight)를 통과시켜주는 OPTIONS 함수 추가
export async function OPTIONS() {
  return NextResponse.json({}, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', 
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
      next: { revalidate: 0 } // 실시간 반영 옵션
    });

    if (!res.ok) {
      throw new Error('Notion API 통신 실패');
    }

    const data = await res.json();

    // 🌟 실장님의 깃허브 이미지 기본 주소 (고정)
    const GITHUB_BASE_URL = "https://raw.githubusercontent.com/86jaewooryu-web/nextjs-boilerplate/main/image/";

    const results = data.results.map((page) => {
      const title = page.properties.title?.title[0]?.plain_text || 'Untitled';
      
      // --- ⬛️ 메인 이미지 추출 ---
      let imageUrl = '';
      // 1) 기존 방식: Files 속성일 경우
      if (page.properties.URL?.type === 'files' && page.properties.URL.files[0]) {
        imageUrl = page.properties.URL.files[0].file?.url || page.properties.URL.files[0].external?.url || '';
      }
      // 2) 🚀 새 방식: 텍스트(Rich text) 속성일 경우 (파일명만 적었을 때)
      else if (page.properties.URL?.type === 'rich_text' && page.properties.URL.rich_text[0]) {
        const fileName = page.properties.URL.rich_text[0].plain_text.trim();
        // 혹시 전체 주소를 다 적었으면 그대로 쓰고, 파일명만 적었으면 깃허브 주소를 앞에 붙여줌
        imageUrl = fileName.startsWith('http') ? fileName : GITHUB_BASE_URL + fileName;
      }
      
      // --- ⬛️ 서브 이미지 다중 추출 ---
      let subImages = '';
      // 1) 기존 방식: Files 속성일 경우
      if (page.properties.SubImages?.type === 'files' && page.properties.SubImages.files.length > 0) {
        subImages = page.properties.SubImages.files
          .map(fileObj => fileObj.file?.url || fileObj.external?.url || '')
          .filter(url => url !== '') 
          .join(','); 
      }
      // 2) 🚀 새 방식: 텍스트(Rich text) 속성일 경우 (쉼표로 구분해서 파일명을 적었을 때)
      else if (page.properties.SubImages?.type === 'rich_text' && page.properties.SubImages.rich_text[0]) {
        const fileNames = page.properties.SubImages.rich_text[0].plain_text;
        subImages = fileNames
          .split(',') // 쉼표 기준으로 쪼갬
          .map(name => name.trim()) // 이름 앞뒤 공백 제거
          .filter(name => name !== '') // 빈 값 제거
          .map(name => name.startsWith('http') ? name : GITHUB_BASE_URL + name) // 깃허브 주소 조립
          .join(','); // 다시 쉼표로 합쳐서 전송
      }

      return {
        id: page.id,
        title,
        imageUrl,
        subImages,
      };
    });

    return NextResponse.json(results, { status: 200, headers: corsHeaders });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to fetch data' }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
