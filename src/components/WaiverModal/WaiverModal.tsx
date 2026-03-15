// src/components/WaiverModal/WaiverModal.tsx
// Reusable waiver modal with drawn signature pad
import { useEffect, useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Check } from '../Icons/Icons';
import styles from './WaiverModal.module.scss';

interface WaiverModalProps {
  customerName: string;
  customerEmail: string;
  serviceType: string;
  bookingId?: string;
  onSign: (signatureData: string) => void;
  onSkip: () => void;
  onClose: () => void;
}

const WaiverModal = ({ customerName, customerEmail, serviceType, bookingId, onSign, onSkip, onClose }: WaiverModalProps) => {
  const canvasRef       = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing]   = useState(false);
  const [hasDrawn, setHasDrawn]     = useState(false);
  const [waiverText, setWaiverText] = useState('');
  const [waiverId, setWaiverId]     = useState<string | null>(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [agreed, setAgreed]         = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    fetchWaiver();
    return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', h); };
  }, []);

  const fetchWaiver = async () => {
    const { data } = await (supabase as any)
      .from('waivers').select('id, content').eq('is_active', true).single();
    if (data) { setWaiverText(data.content); setWaiverId(data.id); }
  };

  // Canvas helpers
  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top)  * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top)  * scaleY,
    };
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current; if (!canvas) return;
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#15141a';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    lastPos.current = pos;
    setHasDrawn(true);
  };

  const endDraw = () => { setIsDrawing(false); lastPos.current = null; };

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSign = async () => {
    if (!hasDrawn || !agreed || !waiverId) return;
    setIsSaving(true);
    try {
      const canvas = canvasRef.current!;
      const signatureData = canvas.toDataURL('image/png');

      await (supabase as any).from('waiver_signatures').insert({
        waiver_id:      waiverId,
        booking_id:     bookingId ?? null,
        customer_email: customerEmail,
        customer_name:  customerName,
        signature_data: signatureData,
        service_type:   serviceType,
        waiver_version: 1,
      });

      onSign(signatureData);
    } catch (err) {
      console.error('Failed to save waiver:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className={styles.backdrop} onClick={onClose} />
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.header}>
          <h2>Participation Waiver</h2>
          <button className={styles.closeBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <div className={styles.body}>
          {/* Waiver text */}
          <div className={styles.waiverText}>
            <pre>{waiverText}</pre>
          </div>

          {/* Agreement checkbox */}
          <label className={styles.agreeCheck}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} />
            <span>I have read and agree to the terms of this waiver</span>
          </label>

          {/* Signature pad */}
          <div className={styles.sigSection}>
            <div className={styles.sigLabel}>
              <span>Draw your signature below</span>
              {hasDrawn && (
                <button className={styles.clearBtn} onClick={clearCanvas}>Clear</button>
              )}
            </div>
            <div className={styles.canvasWrap}>
              <canvas
                ref={canvasRef}
                width={600}
                height={150}
                className={styles.canvas}
                onMouseDown={startDraw}
                onMouseMove={draw}
                onMouseUp={endDraw}
                onMouseLeave={endDraw}
                onTouchStart={startDraw}
                onTouchMove={draw}
                onTouchEnd={endDraw}
              />
              {!hasDrawn && (
                <div className={styles.sigPlaceholder}>Sign here</div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.skipBtn} onClick={onSkip}>Skip for now</button>
          <button
            className={styles.signBtn}
            onClick={handleSign}
            disabled={!hasDrawn || !agreed || isSaving}
          >
            {isSaving ? 'Saving…' : <><Check size={16} /> Sign & Continue</>}
          </button>
        </div>
      </div>
    </>
  );
};

export default WaiverModal;
