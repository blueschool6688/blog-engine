import { useState, useEffect, useRef, useCallback } from 'react';
import { translateService } from '../services/api';
import type { AsyncJobResult } from '../services/api';

/**
 * TranslateProgress mô tả trạng thái tiến trình dịch:
 * - 'idle'       : chưa bắt đầu
 * - 'loading'    : đã gọi API, đang chờ response đầu tiên
 * - 'processing' : backend đang xử lý async job (nội dung dài > 3000 chars)
 * - 'done'       : hoàn thành
 * - 'failed'     : thất bại sau tất cả retry
 */
export type TranslateProgress = 'idle' | 'loading' | 'processing' | 'done' | 'failed';

interface UseTranslateResult {
  /** Văn bản đã dịch. null khi chưa dịch. */
  translatedText: string | null;
  /** Trạng thái tiến trình chi tiết hơn isLoading */
  progress: TranslateProgress;
  /** Shorthand: true khi progress là 'loading' hoặc 'processing' */
  isLoading: boolean;
  /** Thông báo lỗi nếu dịch thất bại */
  error: string | null;
  /** true nếu kết quả được lấy từ cache */
  isFromCache: boolean;
  /** true nếu có ≥1 chunk fallback về nội dung gốc */
  isPartial: boolean;
}

/**
 * useTranslate — custom hook để dịch nội dung động qua NVIDIA AI.
 *
 * @param content   Nội dung cần dịch (HTML hoặc plain text)
 * @param targetLang Ngôn ngữ đích ('vi' hoặc 'en')
 * @param enabled   Chỉ fetch khi enabled = true (lazy loading)
 *
 * Tính năng:
 * - Debounce 300ms nếu content thay đổi liên tục
 * - AbortController: hủy request cũ khi có request mới
 * - Auto-detect async mode: nếu backend trả về job_id → tự động polling mỗi 2s
 * - Cleanup: dừng polling khi component unmount hoặc enabled = false
 * - Fallback: trả về nội dung gốc nếu dịch lỗi (không crash UI)
 */
export function useTranslate(
  content: string,
  targetLang: 'vi' | 'en',
  enabled = false
): UseTranslateResult {
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [progress, setProgress] = useState<TranslateProgress>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const [isPartial, setIsPartial] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /** Dừng polling nếu đang chạy */
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  /** Bắt đầu polling job status mỗi 2s */
  const startPolling = useCallback((jobId: string) => {
    stopPolling();
    setProgress('processing');

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await translateService.pollJob(jobId);
        if (!res.success || !res.data) return;

        const job: AsyncJobResult = res.data;

        if (job.status === 'done') {
          stopPolling();
          setTranslatedText(job.translated_text ?? null);
          setIsPartial(job.partial ?? false);
          setProgress('done');
        } else if (job.status === 'failed') {
          stopPolling();
          setError(job.error ?? 'Translation job failed');
          setProgress('failed');
        }
        // 'pending' | 'processing' → tiếp tục polling
      } catch {
        // Lỗi polling tạm thời → bỏ qua, tiếp tục poll
      }
    }, 2000);
  }, [stopPolling]);

  const doTranslate = useCallback(async () => {
    if (!content.trim()) return;

    // Hủy request cũ nếu đang chạy
    abortRef.current?.abort();
    stopPolling();

    const controller = new AbortController();
    abortRef.current = controller;

    setProgress('loading');
    setError(null);
    setIsFromCache(false);
    setIsPartial(false);

    try {
      const res = await translateService.translate({
        content,
        target_lang: targetLang,
      });

      if (controller.signal.aborted) return;
      if (!res.success || !res.data) {
        throw new Error(res.message || 'Translation failed');
      }

      const data = res.data;

      // Kiểm tra xem backend có chuyển sang async mode không (job_id hiện diện)
      if (data.job_id) {
        // Async mode: backend đang xử lý job — bắt đầu polling
        startPolling(data.job_id);
        return;
      }

      // Sync mode: kết quả ngay trong response
      if (!controller.signal.aborted) {
        setTranslatedText(data.translated_text);
        setIsFromCache(data.from_cache ?? false);
        setIsPartial(data.partial ?? false);
        setProgress('done');

        // Backend trả error field nhưng vẫn có translated_text (fallback)
        if (data.error) {
          setError(data.error);
        }
      }
    } catch (err: any) {
      if (controller.signal.aborted) return;
      setError(err?.response?.data?.message || err?.message || 'Translation failed');
      setProgress('failed');
    }
  }, [content, targetLang, startPolling, stopPolling]);

  useEffect(() => {
    if (!enabled) {
      // Reset khi người dùng tắt translate
      setTranslatedText(null);
      setError(null);
      setIsFromCache(false);
      setIsPartial(false);
      setProgress('idle');
      stopPolling();
      abortRef.current?.abort();
      return;
    }

    // Debounce 300ms để tránh gọi API liên tục khi content thay đổi nhanh
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doTranslate();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [enabled, doTranslate, stopPolling]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
      stopPolling();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [stopPolling]);

  const isLoading = progress === 'loading' || progress === 'processing';

  return { translatedText, progress, isLoading, error, isFromCache, isPartial };
}
