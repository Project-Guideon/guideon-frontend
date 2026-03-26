'use client';

import {
    MdOutlineWc,
    MdOutlineConfirmationNumber,
    MdOutlineRestaurant,
    MdOutlineShoppingBag,
    MdOutlineInfo,
    MdOutlineAttractions,
    MdOutlineLocalParking,
    MdOutlinePlace,
} from 'react-icons/md';
import type { PlaceCategory } from '@/features/place/domain/entities/Place';

const CATEGORY_ICON_MAP: Record<PlaceCategory, React.ElementType> = {
    TOILET: MdOutlineWc,
    TICKET: MdOutlineConfirmationNumber,
    RESTAURANT: MdOutlineRestaurant,
    SHOP: MdOutlineShoppingBag,
    INFO: MdOutlineInfo,
    ATTRACTION: MdOutlineAttractions,
    PARKING: MdOutlineLocalParking,
    OTHER: MdOutlinePlace,
};

interface PlaceCategoryIconProps {
    category: PlaceCategory;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    withBackground?: boolean;
    color?: string;
    className?: string;
}

const SIZE_MAP = {
    sm: { icon: 'w-3.5 h-3.5', container: 'w-6 h-6 rounded-lg' },
    md: { icon: 'w-4 h-4', container: 'w-8 h-8 rounded-xl' },
    lg: { icon: 'w-5 h-5', container: 'w-10 h-10 rounded-xl' },
    xl: { icon: 'w-7 h-7', container: 'w-[52px] h-[52px] rounded-[1.2rem]' },
};

/** 카테고리에 맞는 Material Design 아이콘을 렌더링하는 컴포넌트 */
export function PlaceCategoryIcon({ category, size = 'md', withBackground = true, color, className = '' }: PlaceCategoryIconProps) {
    const Icon = CATEGORY_ICON_MAP[category];
    const sizeConfig = SIZE_MAP[size];

    if (!withBackground) {
        return <Icon className={`${sizeConfig.icon} ${className}`} style={color ? { color } : undefined} />;
    }

    return (
        <span
            className={`inline-flex items-center justify-center ${sizeConfig.container} text-white shrink-0 ${className}`}
            style={{ backgroundColor: color }}
        >
            <Icon className={sizeConfig.icon} />
        </span>
    );
}
