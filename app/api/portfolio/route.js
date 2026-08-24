import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    const apiKey = process.env.NOTION_API_KEY;

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
    });

    if (!res.ok) {
      throw new Error('Failed to fetch from Notion API');
    }

    const data = await res.json();

    const results = data.results.map((page) => {
      const title = page.properties.title?.title[0]?.plain_text || 'Untitled';
      
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
