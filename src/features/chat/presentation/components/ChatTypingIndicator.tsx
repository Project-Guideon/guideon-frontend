'use client';

/** AI 응답 대기 중 표시하는 3-dot wave 인디케이터 */
export function ChatTypingIndicator() {
    return (
        <div className="flex items-start gap-2 mb-3">
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center shrink-0 text-orange-500 text-xs font-bold">
                AI
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex items-center gap-1.5">
                    <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: '0ms' }}
                    />
                    <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: '150ms' }}
                    />
                    <span
                        className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: '300ms' }}
                    />
                </div>
            </div>
        </div>
    );
}
