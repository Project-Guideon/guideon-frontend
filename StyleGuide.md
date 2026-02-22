# GUIDEON Frontend Style & Architecture Guide

이 문서는 GUIDEON 프로젝트의 웹 페이지 코드 품질 유지를 위한 가이드라인입니다. 모든 코드 작성 및 리뷰 시 이 규칙을 준수해야 합니다.

## 1. 아키텍처 원칙: Feature-based Architecture (Next.js App Router)

도메인 중심 설계를 기반으로 UI와 비즈니스 로직을 분리하고, 유지보수성을 높이기 위해 관심사를 분리합니다.

### 📂 디렉토리 구조 및 역할

Next.js 14 App Router와 Clean Architecture 원칙을 결합한 구조를 사용합니다.

```text
src/
├── app/                      # Next.js 라우팅 전용 (Page Layer)
│   ├── layout.tsx            # 전역 레이아웃
│   ├── page.tsx              # 루트 페이지
│   ├── login/
│   │   └── page.tsx          # 로그인 페이지
│   └── admin/
│       ├── layout.tsx        # 관리자 레이아웃
│       ├── page.tsx          # 관리자 대시보드
│       ├── sites/            # 관광지 관리
│       ├── zones/            # 구역 관리
│       ├── places/           # 장소 관리
│       └── devices/          # 디바이스 관리
│
├── features/                 # 기능별 모듈 (Feature Layer)
│   ├── auth/                 # 인증 기능
│   │   ├── domain/           # 도메인 로직 & 엔티티
│   │   │   ├── entities/     # User, Session 등 도메인 엔티티
│   │   │   └── services/     # 비즈니스 로직 (순수 TS)
│   │   ├── application/      # 애플리케이션 로직 (Use Cases)
│   │   │   ├── hooks/        # useAuth, useLogin 등 React Hooks
│   │   │   └── store/        # Context API 상태 관리
│   │   └── presentation/     # 표현 계층
│   │       ├── components/   # LoginForm, AuthGuard 등 UI
│   │       └── types/        # Props 인터페이스
│   │
│   ├── site/                 # 관광지 기능
│   │   ├── domain/
│   │   ├── application/
│   │   └── presentation/
│   │
│   ├── zone/                 # 구역 기능
│   ├── place/                # 장소 기능
│   └── document/             # 문서 기능
│
├── shared/                   # 공통 리소스 (Shared Layer)
│   ├── components/           # 공통 UI 컴포넌트
│   │   ├── ui/               # Button, Input, Modal 등 기본 UI
│   │   └── layout/           # Header, Sidebar, Footer 등
│   ├── hooks/                # 공통 커스텀 훅 (useDebounce, useMediaQuery)
│   ├── utils/                # 유틸리티 함수 (날짜 포맷, 문자열 처리)
│   └── types/                # 전역 타입 정의 (ApiResponse, Pagination 등)
│
├── api/                      # API 통신 계층 (Infrastructure Layer)
│   ├── client.ts             # Axios 인스턴스 설정 (Interceptors)
│   └── endpoints/            # API 엔드포인트 함수
│       ├── auth.ts           # 인증 API
│       ├── site.ts           # 관광지 API
│       ├── zone.ts           # 구역 API
│       └── place.ts          # 장소 API
│
└── middleware.ts             # Next.js 미들웨어 (인증 가드 등)
```

### 🏗 계층별 규칙

#### **1. Page Layer (`app/`)**
- **역할**: 라우팅 처리, 메타데이터 설정, 초기 데이터 페칭(Server Component)
- **규칙**: 
  - 비즈니스 로직을 직접 작성하지 않음
  - `features`의 컴포넌트와 훅을 조합하여 화면 구성
  - Server Component를 기본으로 사용

**예시:**
```tsx
// app/admin/places/page.tsx
import { PlaceListView } from '@/features/place/presentation/components/PlaceListView';

export default function PlacesPage() {
  return <PlaceListView />; // 단순 조합만
}
```

---

#### **2. Feature Layer (`features/`)**
각 기능을 **domain → application → presentation** 순서로 계층화합니다.

##### **2.1 Domain Layer (`domain/`)**
- **역할**: 순수한 비즈니스 로직과 도메인 엔티티 (Framework 독립적)
- **포함**: 
  - `entities/`: 도메인 모델 (타입 + 검증 로직)
  - `services/`: 비즈니스 규칙 (React 없는 순수 TypeScript)

**예시:**
```typescript
// features/auth/domain/entities/User.ts
export interface User {
  id: number;
  email: string;
  role: 'PLATFORM_ADMIN' | 'SITE_ADMIN';
}

// features/auth/domain/services/authService.ts
export const validatePassword = (password: string): boolean => {
  return password.length >= 8;
};
```

##### **2.2 Application Layer (`application/`)**
- **역할**: Use Case 구현 (React Hooks, 상태 관리)
- **포함**:
  - `hooks/`: 비즈니스 로직을 캡슐화한 Custom Hooks
  - `store/`: Context API 기반 상태 관리

**예시:**
```typescript
// features/auth/application/hooks/useLogin.ts
import { loginApi } from '@/api/endpoints/auth';

export function useLogin() {
  const [isLoading, setIsLoading] = useState(false);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const response = await loginApi(email, password);
    // ... 로직
  };
  
  return { login, isLoading };
}
```

##### **2.3 Presentation Layer (`presentation/`)**
- **역할**: UI 컴포넌트 (React Component)
- **포함**:
  - `components/`: 해당 기능 전용 컴포넌트
  - `types/`: Props 인터페이스

**예시:**
```tsx
// features/auth/presentation/components/LoginForm.tsx
'use client';

import { useLogin } from '@/features/auth/application/hooks/useLogin';

export function LoginForm() {
  const { login, isLoading } = useLogin();
  // ... UI 렌더링
}
```

---

#### **3. Shared Layer (`shared/`)**
- **역할**: 도메인 맥락을 모르는 범용 공통 리소스
- **규칙**: 
  - 특정 기능(feature)에 종속되지 않음
  - 재사용성 최우선
  - `components/ui/`: Shadcn UI, Radix UI 등 기본 컴포넌트
  - `components/layout/`: Header, Sidebar 등 레이아웃 컴포넌트

**예시:**
```tsx
// shared/components/ui/Button.tsx
export function Button({ children, ...props }: ButtonProps) {
  return <button {...props}>{children}</button>;
}

// shared/utils/formatDate.ts
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
```

---

#### **4. API Layer (`api/`)**
- **역할**: 백엔드 통신 인프라
- **규칙**:
  - 모든 API 호출은 `endpoints/` 함수를 통해 수행
  - `client.ts`에서 Axios Interceptor 설정 (토큰 주입, 에러 처리)

**예시:**
```typescript
// api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// api/endpoints/auth.ts
import { apiClient } from '../client';

export const loginApi = async (email: string, password: string) => {
  const response = await apiClient.post('/admin/auth/login', { email, password });
  return response.data;
};
```

---

### 📌 핵심 원칙

1. **의존성 방향**: `presentation → application → domain` (단방향)
2. **관심사 분리**: 
   - Domain은 React 몰라도 됨 (순수 TS)
   - Application은 비즈니스 로직 집중
   - Presentation은 UI만 담당
3. **재사용성**: Shared에는 도메인 지식 넣지 않기

## 2. 명명 규칙 (Naming Convention)

가독성을 최우선으로 하며, 약어 사용을 지양합니다.

### 파일 및 컴포넌트
*   **컴포넌트 파일 (.tsx)**: PascalCase (예: `UserProfile.tsx`, `LoginForm.tsx`)
*   **훅 파일 (.ts)**: `use` 접두사 + camelCase (예: `useAuth.ts`, `usePlaceList.ts`)
*   **유틸리티/함수 파일 (.ts)**: camelCase (예: `formatDate.ts`, `apiClient.ts`)

### 변수 및 함수
*   **변수/함수**: camelCase (예: `userData`, `fetchPlaceList`, `handleClick`)
*   **상수**: SCREAMING_SNAKE_CASE (예: `API_BASE_URL`, `MAX_RETRY_COUNT`)
*   **이벤트 핸들러**: handle + 동사 + 명사 (예: `handleSubmit`, `handleInputChange`)
*   **Props 인터페이스**: 컴포넌트명 + Props (예: `LoginFormProps`)

### 🚫 줄임말 사용 지침 (Practical Naming)
업계 표준 약어 외에는 **풀네임(Full Name)**을 사용합니다.

*   **허용**: id, url, api, ui, ux, json, html, css
*   **금지 (우측 권장)**:
    *   req → request
    *   res → response
    *   btn → button
    *   img → image
    *   idx → index
    *   func → function
    *   auth → authentication (단, auth는 문맥상 허용)

## 3. 상태 관리 및 Hooks (React & Next.js)

Next.js 14와 React 18의 패턴을 준수합니다.

### State 사용 원칙
*   **Server State**: 서버 데이터(API 응답)는 React Query 또는 useEffect + fetch를 사용해 관리합니다. (단, 초기 로딩은 Server Component 활용 권장)
*   **Client State**: UI 상태(모달 열림/닫힘, 입력값)는 useState를 사용합니다.
*   **Global State**: 전역 상태(로그인 정보 등)는 Context API를 사용합니다. (가볍고 Next.js 내장 기능이므로 적합)

### Hooks 작성 규칙
비즈니스 로직은 컴포넌트 안에 useEffect를 길게 쓰지 말고, Custom Hook(`use...`)으로 분리합니다.
*   **Bad**: `page.tsx` 안에 50줄짜리 useEffect
*   **Good**: `usePlaceData()` 훅을 만들어서 `const { data } = usePlaceData();`로 호출

## 4. API 통신 및 에러 처리

### Axios 클라이언트 (src/lib/axios.ts)
모든 요청은 중앙화된 `axiosInstance`를 사용합니다.
*   **Request Interceptor**: 자동으로 Authorization 헤더에 토큰(JWT)을 주입합니다.
*   **Response Interceptor**: 토큰 만료(401) 시 자동 로그아웃 처리를 수행합니다.

### 타입 정의 (Response Wrapper)
모든 API 응답은 백엔드 명세서(Common Response Envelope)에 맞추어 타입을 정의합니다.

```typescript
// src/types/api.ts
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error: {
    code: string;
    message: string;
    details?: unknown;
  } | null;
  trace_id: string;
}
```

## 5. 컴포넌트 설계 가이드

### Server Component vs Client Component
*   **Server Component (기본)**: 데이터 페칭, 민감한 로직 처리. async/await 사용 가능.
*   **Client Component**: `'use client'` 선언 필요. useState, useEffect, onClick 등 상호작용이 필요한 경우 사용.

### Props Typing
TypeScript의 Interface를 사용하여 Props 타입을 명시합니다. `any` 타입 사용은 엄격히 금지합니다.

```typescript
interface PlaceCardProps {
  placeId: number;
  name: string;
  description?: string; // Optional
  onDelete: (id: number) => void;
}

export default function PlaceCard({ placeId, name, onDelete }: PlaceCardProps) {
  // ...
}
```

## 6. 스타일링 (Tailwind CSS)

*   **Utility-first**: 별도의 .css 파일 생성 대신 Tailwind 클래스를 우선 사용합니다.
*   **가독성**: 클래스가 너무 길어지면 `cn()` (clsx + tailwind-merge) 유틸리티를 사용하거나 컴포넌트로 분리합니다.
*   **반응형**: 모바일 우선(Mobile First) 원칙을 따릅니다.
    *   예: `class="w-full md:w-1/2"` (기본 100%, 중간 화면 이상 50%)

## 7. 테스트 코드 (Optional)

- 모든 핵심 로직과 컴포넌트에는 테스트를 포함합니다.
- **단위 테스트**: 도메인 로직 및 유틸리티 함수
- **컴포넌트 테스트**: UI 컴포넌트 렌더링 및 상호작용
- **통합 테스트**: 기능별 엔드투엔드 플로우
- 테스트 메서드 명은 `Given_When_Then` 구조를 따르는 한글 이름을 허용합니다.
  - 예: `사용자_프로필_조회_성공_테스트()`, `로그인_실패_시_에러_표시_테스트()`

## 8. 코드 품질 및 성능

### 성능 최적화

- **불필요한 리렌더링 방지**: `createMemo`를 활용한 메모이제이션
- **지연 로딩**: 코드 스플리팅 및 동적 임포트 활용
- **이미지 최적화**: 적절한 이미지 포맷 및 크기 사용

### 코드 품질

- **ESLint/Prettier**: 코드 포맷팅 및 린팅 규칙 준수
- **타입 안전성**: `any` 타입 사용 최소화
- **코드 리뷰**: PR 시 코드 리뷰를 통해 품질 검증
