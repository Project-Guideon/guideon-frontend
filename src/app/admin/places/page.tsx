import { redirect } from 'next/navigation';

/** `/admin/places`는 통합 페이지인 `/admin/zones`로 리다이렉트 */
export default function PlacesRedirectPage() {
    redirect('/admin/zones');
}
