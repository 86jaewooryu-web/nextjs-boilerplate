'use client';

import { useEffect, useState } from 'react';

interface PortfolioItem {
  title: string;
  imageUrl: string;
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <main
      style={{
        paddingTop: '130px', // 상단에서 130px 띄우기
        paddingLeft: '20px',
        paddingRight: '20px',
        minHeight: '100vh',
        backgroundColor: '#000', // 어두운 배경톤
        boxSizing: 'border-box',
      }}
    >
      {loading ? (
        <div style={{ color: '#fff', textAlign: 'center' }}>로딩 중...</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)', // 가로 3줄(3열) 풀프레임 배치
            gap: '10px',                             // 이미지 간격 10px
            width: '100%',
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                position: 'relative',
                width: '100%',
                aspectRatio: '4 / 3', // 이미지 비율 (정사각형을 원하시면 '1 / 1'로 변경 가능)
                overflow: 'hidden',
                backgroundColor: '#111',
                borderRadius: '4px',
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover', // 풀프레임 채우기
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 'bold',
                  }}
                >
                  {item.title}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
