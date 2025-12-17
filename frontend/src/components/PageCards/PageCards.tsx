'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import styles from './PageCards.module.css';

interface PageCard {
  id: string;
  image: string;
  route: string;
  title: string;
}

const pages: PageCard[] = [
  {
    id: 'suppliers-rating',
    image: '/images/suppliers-rating.svg',
    route: '/suppliers-rating',
    title: 'Рейтинг поставщиков'
  },
  {
    id: 'parts-rating',
    image: '/images/parts-rating.svg',
    route: '/parts-rating',
    title: 'Рейтинг автозапчастей'
  },
  {
    id: 'clustering',
    image: '/images/suppliers-clustering.svg',
    route: '/clustering',
    title: 'Кластеризация поставщиков'
  },
  {
    id: 'price-forecasting',
    image: '/images/price-forecasting.svg',
    route: '/price-forecasting',
    title: 'Прогнозирование цен автозапчастей'
  }
];

interface SVGContentProps {
  src: string;
  cardId: string;
}

function SVGContent({ src, cardId }: SVGContentProps) {
  const [svgContent, setSvgContent] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(src)
      .then((res) => res.text())
      .then((text) => setSvgContent(text))
      .catch((err) => console.error('Failed to load SVG:', err));
  }, [src]);

  useEffect(() => {
    if (!containerRef.current || cardId !== 'price-forecasting' || !svgContent) return;

    const card = containerRef.current.closest(`[data-card-id="${cardId}"]`);
    if (!card) return;

    const handleMouseEnter = () => {
      setTimeout(() => {
        const circles = containerRef.current?.querySelectorAll('svg circle.forecast-point');
        if (circles) {
          circles.forEach((circle, index) => {
            const delay = index * 0.2;
            (circle as SVGElement).style.setProperty('animation', 'pointGlow 1.6s ease-in-out infinite');
            (circle as SVGElement).style.setProperty('animation-delay', `${delay}s`);
          });
        }
      }, 10);
    };

    const handleMouseLeave = () => {
      const circles = containerRef.current?.querySelectorAll('svg circle.forecast-point');
      if (circles) {
        circles.forEach((circle) => {
          (circle as SVGElement).style.removeProperty('animation');
          (circle as SVGElement).style.removeProperty('animation-delay');
        });
      }
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [svgContent, cardId]);

  if (!svgContent) {
    return <div className={styles.svgLoader}>Загрузка...</div>;
  }

  return (
    <div
      ref={containerRef}
      className={styles.svgContainer}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      data-card-id={cardId}
    />
  );
}

export default function PageCards() {
  const router = useRouter();

  const handleCardClick = (route: string) => {
    if (route !== '#') {
      router.push(route);
    }
  };

  return (
    <div className={styles.cardsContainer}>
      {pages.map((page) => (
        <div
          key={page.id}
          className={`${styles.card} ${page.route === '#' ? styles.disabled : ''}`}
          onClick={() => handleCardClick(page.route)}
          data-card-id={page.id}
        >
          <div className={styles.imageWrapper}>
            <SVGContent src={page.image} cardId={page.id} />
          </div>
          <div className={styles.title}>{page.title}</div>
        </div>
      ))}
    </div>
  );
}

