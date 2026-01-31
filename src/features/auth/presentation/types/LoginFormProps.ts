// LoginForm 컴포넌트 Props 타입 정의

export interface LoginFormProps {
    /** 폼 제출 핸들러 */
    onSubmit?: (email: string, password: string) => Promise<void>;
    /** 로딩 상태 */
    isLoading?: boolean;
    /** 에러 메시지 */
    errorMessage?: string | null;
    /** 추가 CSS 클래스 */
    className?: string;
}

export interface LoginInputProps {
    /** input type */
    type: 'email' | 'password';
    /** input name */
    name: string;
    /** label 텍스트 */
    label: string;
    /** 값 */
    value: string;
    /** 변경 핸들러 */
    onChange: (value: string) => void;
    /** 필수 여부 */
    required?: boolean;
    /** 애니메이션 딜레이 인덱스 */
    animationDelay?: number;
}
