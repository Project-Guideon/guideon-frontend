'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Map, useKakaoLoader } from 'react-kakao-maps-sdk';
import { HiOutlineMagnifyingGlass, HiOutlineMapPin } from 'react-icons/hi2';

const DEFAULT_LATITUDE = 37.5796;
const DEFAULT_LONGITUDE = 126.9770;
const DEFAULT_MAP_LEVEL = 4;

/**
 * 카카오 장소 검색 결과
 */
interface PlaceResult {
    place_name: string;
    address_name: string;
    road_address_name?: string;
    /** 경도 (longitude) */
    x: string;
    /** 위도 (latitude) */
    y: string;
}

/**
 * SiteMapPickerProps
 */
export interface SiteMapPickerProps {
    initialLatitude?: number | null;
    initialLongitude?: number | null;
    initialMapLevel?: number | null;
    onChange: (latitude: number, longitude: number, mapLevel: number) => void;
}

/**
 * 관광지 지도 위치 피커
 *
 * - 장소 검색(Kakao Places API)으로 원하는 위치로 빠르게 이동
 * - 지도 드래그/줌으로 중심 핀 위치 세부 조정
 * - onChange가 호출될 때마다 부모에 현재 위도·경도·줌 레벨을 전달
 */
export function SiteMapPicker({
    initialLatitude,
    initialLongitude,
    initialMapLevel,
    onChange,
}: SiteMapPickerProps) {
    const [loading, loadError] = useKakaoLoader({
        appkey: process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY ?? '',
        libraries: ['services'],
    });

    /**
     * mapCenter는 외부에서 지도 위치를 제어할 때만 변경합니다 (검색 결과 선택).
     * 사용자가 직접 드래그할 때는 mapCenter를 갱신하지 않고 onChange 콜백만 호출합니다.
     * 이렇게 하면 드래그 중 지도가 초기 위치로 튀는 현상을 방지할 수 있습니다.
     */
    const [mapCenter, setMapCenter] = useState({
        lat: initialLatitude ?? DEFAULT_LATITUDE,
        lng: initialLongitude ?? DEFAULT_LONGITUDE,
    });
    const [mapLevel, setMapLevel] = useState(initialMapLevel ?? DEFAULT_MAP_LEVEL);
    const [isPanto, setIsPanto] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<PlaceResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    /**
     * onChange는 ref로 관리해 stale closure 없이 최신 값을 유지합니다.
     */
    const onChangeRef = useRef(onChange);
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    /** 마운트 시 초기 좌표를 부모에 전달 */
    useEffect(() => {
        onChangeRef.current(
            initialLatitude ?? DEFAULT_LATITUDE,
            initialLongitude ?? DEFAULT_LONGITUDE,
            initialMapLevel ?? DEFAULT_MAP_LEVEL,
        );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /** 장소 키워드 검색 */
    const handleSearch = useCallback(() => {
        const trimmed = searchQuery.trim();
        if (!trimmed) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const kakaoServices = (window as any).kakao?.maps?.services;
        if (!kakaoServices) return;

        setIsSearching(true);
        setIsDropdownOpen(false);

        const placesService = new kakaoServices.Places();
        placesService.keywordSearch(
            trimmed,
            (results: PlaceResult[], status: string) => {
                setIsSearching(false);
                if (status === kakaoServices.Status.OK && results.length > 0) {
                    setSearchResults(results.slice(0, 8));
                    setIsDropdownOpen(true);
                } else {
                    setSearchResults([]);
                }
            },
        );
    }, [searchQuery]);

    /** 검색 결과 선택 → 지도 이동 */
    const handleSelectPlace = useCallback((place: PlaceResult) => {
        const lat = parseFloat(place.y);
        const lng = parseFloat(place.x);

        setMapCenter({ lat, lng });
        setMapLevel(DEFAULT_MAP_LEVEL);
        setIsPanto(true);
        setSearchQuery(place.place_name);
        setIsDropdownOpen(false);

        onChangeRef.current(lat, lng, DEFAULT_MAP_LEVEL);
    }, []);

    /** 드래그/줌 종료 시 현재 중심 좌표 부모에 전달 */
    const handleMapMoved = useCallback((map: kakao.maps.Map) => {
        const center = map.getCenter();
        onChangeRef.current(center.getLat(), center.getLng(), map.getLevel());
    }, []);

    if (loading) {
        return (
            <div className="w-full h-72 rounded-xl bg-slate-100 flex items-center justify-center gap-3 text-slate-400">
                <div className="relative w-8 h-8">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                    <div className="absolute inset-0 rounded-full border-2 border-orange-400 border-t-transparent animate-spin" />
                </div>
                <p className="text-sm font-medium">지도 로딩 중...</p>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="w-full h-72 rounded-xl bg-red-50 flex items-center justify-center text-red-400 text-sm font-medium">
                지도를 불러오지 못했습니다.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5">
            {/* 검색 바 */}
            <div className="relative">
                <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                        <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(event) => {
                                setSearchQuery(event.target.value);
                                if (!event.target.value.trim()) setIsDropdownOpen(false);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleSearch();
                                }
                                if (event.key === 'Escape') setIsDropdownOpen(false);
                            }}
                            placeholder="장소 검색 (예: 경기대학교, 경복궁)"
                            className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm
                                font-medium text-slate-800 placeholder:text-slate-400 outline-none transition-all duration-150
                                focus:border-orange-400 focus:ring-2 focus:ring-orange-100 focus:bg-white"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={isSearching || !searchQuery.trim()}
                        className="flex items-center gap-1.5 h-10 px-4 bg-orange-500 text-white rounded-xl text-sm font-bold
                            hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                        {isSearching ? (
                            <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        ) : (
                            <HiOutlineMagnifyingGlass className="w-4 h-4" />
                        )}
                        검색
                    </button>
                </div>

                {/* 검색 결과 드롭다운 */}
                {isDropdownOpen && searchResults.length > 0 && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsDropdownOpen(false)}
                        />
                        <div className="absolute top-full left-0 right-12 mt-1.5 z-50 bg-white border border-slate-200/80
                            rounded-2xl shadow-[0_8px_30px_-6px_rgba(0,0,0,0.18)] overflow-hidden">
                            {searchResults.map((place, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelectPlace(place)}
                                    className="w-full flex items-start gap-3 px-4 py-3 hover:bg-orange-50 transition-colors
                                        border-b border-slate-100 last:border-0 text-left group"
                                >
                                    <HiOutlineMapPin className="w-4 h-4 text-slate-400 group-hover:text-orange-500 transition-colors mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-bold text-slate-800 group-hover:text-orange-700">
                                            {place.place_name}
                                        </p>
                                        <p className="text-xs text-slate-400 mt-0.5">
                                            {place.road_address_name || place.address_name}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* 지도 */}
            <div className="relative w-full h-72 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                <Map
                    center={mapCenter}
                    level={mapLevel}
                    isPanto={isPanto}
                    style={{ width: '100%', height: '100%' }}
                    onDragEnd={handleMapMoved}
                    onZoomChanged={handleMapMoved}
                    onIdle={() => setIsPanto(false)}
                />

                {/* 중심 고정 핀 오버레이 */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative flex flex-col items-center drop-shadow-lg -translate-y-3">
                        <div className="w-5 h-5 rounded-full bg-orange-500 border-2 border-white shadow-md" />
                        <div className="w-[2px] h-4 bg-orange-500" />
                        <div className="w-2.5 h-1 rounded-full bg-orange-400/50" />
                    </div>
                </div>

                {/* 우하단 도움말 뱃지 */}
                <div className="absolute bottom-3 left-3 px-2.5 py-1 bg-white/90 backdrop-blur-sm rounded-full
                    text-[10px] font-bold text-slate-500 shadow-sm border border-slate-200/60">
                    드래그·핀치로 위치 조정
                </div>
            </div>

            <p className="text-[11px] text-slate-400">
                핀이 꽂힌 위치가 저장됩니다. 검색 후 지도를 세부 조정할 수 있습니다.
            </p>
        </div>
    );
}
