// src/components/AlphabetTracerReact.tsx
// 'use client'; // Dòng này có thể giữ lại hoặc xóa nếu không dùng Next.js App Router

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Định nghĩa kiểu dữ liệu (giữ nguyên)
interface Point {
    x: number;
    y: number;
}

interface LetterDefinition {
    character: string;
    strokes: Point[][];
}

// Dữ liệu chữ cái (giữ nguyên)
const ALPHABET_DATA: LetterDefinition[] = [
    {
        character: "A",
        strokes: [
            [{ x: 200, y: 50 }, { x: 175, y: 125 }, { x: 150, y: 200 }, { x: 125, y: 275 }, { x: 100, y: 350 }],
            [{ x: 200, y: 50 }, { x: 225, y: 125 }, { x: 250, y: 200 }, { x: 275, y: 275 }, { x: 300, y: 350 }],
            [{ x: 130, y: 200 }, { x: 165, y: 200 }, { x: 200, y: 200 }, { x: 235, y: 200 }, { x: 270, y: 200 }],
        ]
    },
    {
        character: "B",
        strokes: [
            [{ x: 100, y: 50 }, { x: 100, y: 110 }, { x: 100, y: 170 }, { x: 100, y: 230 }, { x: 100, y: 290 }, { x: 100, y: 350 }],
            [{ x: 100, y: 50 }, { x: 160, y: 50 }, { x: 210, y: 60 }, { x: 240, y: 90 }, { x: 240, y: 130 }, { x: 210, y: 160 }, { x: 160, y: 170 }, { x: 100, y: 170 } ],
            [{ x: 100, y: 170 }, { x: 170, y: 170 }, { x: 230, y: 190 }, { x: 260, y: 230 }, { x: 260, y: 280 }, { x: 230, y: 320 }, { x: 170, y: 350 }, { x: 100, y: 350 } ],
        ]
    },
    {
        character: "a",
        strokes: [
            [
                { x: 250, y: 180 }, { x: 235, y: 160 }, { x: 215, y: 148 }, { x: 190, y: 150 },
                { x: 170, y: 165 }, { x: 150, y: 190 }, { x: 140, y: 220 }, { x: 135, y: 250 },
                { x: 145, y: 280 }, { x: 170, y: 305 }, { x: 200, y: 315 }, { x: 230, y: 305 },
                { x: 255, y: 280 }, { x: 268, y: 250 }, { x: 265, y: 215 }, { x: 250, y: 180 }
            ],
            [
                { x: 268, y: 170 }, { x: 268, y: 200 }, { x: 268, y: 230 }, { x: 268, y: 260 },
                { x: 270, y: 290 }, { x: 275, y: 315 }
            ]
        ]
    },
    {
        character: "L",
        strokes: [
            [{ x: 100, y: 50 }, { x: 100, y: 110 }, { x: 100, y: 170 }, { x: 100, y: 230 }, { x: 100, y: 290 }, { x: 100, y: 350 }],
            [{ x: 100, y: 350 }, { x: 150, y: 350 }, { x: 200, y: 350 }, { x: 250, y: 350 }, { x: 300, y: 350 }],
        ]
    },
];

// Hằng số (giữ nguyên)
const GUIDE_DOT_COLOR = 'rgba(180, 180, 180, 0.9)';
const GUIDE_DOT_RADIUS = 7;
const ACTIVE_GUIDE_DOT_COLOR = 'orange';
const ACTIVE_GUIDE_DOT_RADIUS = 9;
const INITIAL_ACTIVE_GUIDE_DOT_RADIUS = 12;
const COMPLETED_GUIDE_DOT_COLOR = 'rgba(120, 220, 120, 0.8)';
const TRACED_LINE_FILL_COLOR = 'rgba(0, 180, 0, 0.5)';
const USER_LINE_COLOR = 'rgba(60, 60, 255, 0.7)';
const LETTER_OUTLINE_COLOR = 'rgba(220, 220, 220, 0.7)';
const DASHED_LINE_COLOR = 'rgba(130, 130, 130, 0.9)';
const DASHED_LINE_WIDTH = 3;
const USER_LINE_WIDTH = 30;
const OUTLINE_LINE_WIDTH = 45;
const FINAL_COMPLETED_LETTER_COLOR = 'rgba(0, 60, 120, 0.85)';
const HIT_TOLERANCE = 28;
const START_TOLERANCE = 40;
const STRAY_TOLERANCE = 30;

const OLI_GRID_COLOR_LIGHT = '#d1e9ff';
const OLI_GRID_COLOR_DARKER = '#a8d8ff';
const OLI_MARGIN_LINE_COLOR = '#ffacac';
const OLI_GRID_SIZE = 20;


interface Toast { id: number; text: string; type: 'success' | 'info' | 'error'; }

// Hàm tiện ích (giữ nguyên)
function sqr(x: number) { return x * x }
function distSquared(p1: Point, p2: Point) { return sqr(p1.x - p2.x) + sqr(p1.y - p2.y) }
function distanceToLineSegment(p: Point, v: Point, w: Point): number {
  const l2 = distSquared(v, w);
  if (l2 === 0) return Math.sqrt(distSquared(p, v));
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projection = { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) };
  return Math.sqrt(distSquared(p, projection));
}

const AlphabetTracerReactComponent: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    const [currentAlphabetIndex, setCurrentAlphabetIndex] = useState<number>(0);
    const [currentLetterDef, setCurrentLetterDef] = useState<LetterDefinition | null>(null);
    
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const userCurrentStrokePointsRef = useRef<Point[]>([]); 
    const [completedStrokeSegments, setCompletedStrokeSegments] = useState<Point[][]>([]);

    const [currentStrokeIndex, setCurrentStrokeIndex] = useState<number>(0);
    const [nextExpectedPointIndex, setNextExpectedPointIndex] = useState<number>(0);
    
    const [isLetterFullyCompleted, setIsLetterFullyCompleted] = useState<boolean>(false);

    const [toasts, setToasts] = useState<Toast[]>([]);
    const toastIdCounter = useRef(0);

    // `removeToast` được định nghĩa bằng `useCallback` để ổn định tham chiếu.
    const removeToast = useCallback((id: number) => {
        setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
    }, []);

    // `addToast` phụ thuộc vào `removeToast`.
    const addToast = useCallback((text: string, type: Toast['type'], duration: number = 3000) => {
        const id = toastIdCounter.current++;
        setToasts(prevToasts => [...prevToasts, { id, text, type }]);
        const timerId = setTimeout(() => {
            removeToast(id);
        }, duration);
        // Cleanup function cho useEffect hoặc khi gọi trực tiếp để tránh memory leak nếu component unmount trước khi timeout
        return () => clearTimeout(timerId); 
    }, [removeToast]);
    

    const drawOliGrid = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
        ctx.save();
        ctx.strokeStyle = OLI_GRID_COLOR_LIGHT;
        ctx.lineWidth = 0.7;
        for (let x = 0; x <= width; x += OLI_GRID_SIZE) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
        }
        for (let y = 0; y <= height; y += OLI_GRID_SIZE) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
        ctx.strokeStyle = OLI_GRID_COLOR_DARKER;
        ctx.lineWidth = 1;
        for (let y = OLI_GRID_SIZE * 4; y <= height; y += (OLI_GRID_SIZE * 4)) { 
            if (y === 0 && height > 0) continue;
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
        }
        const marginLineX1 = OLI_GRID_SIZE * 2;
        ctx.strokeStyle = OLI_MARGIN_LINE_COLOR;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(marginLineX1, 0); ctx.lineTo(marginLineX1, height); ctx.stroke();
        ctx.restore();
    }, []);

    const drawScene = useCallback(() => {
        const ctx = canvasCtxRef.current;
        if (!ctx || !canvasRef.current) return;
        
        const canvasWidth = canvasRef.current.width;
        const canvasHeight = canvasRef.current.height;
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawOliGrid(ctx, canvasWidth, canvasHeight);

        if (!currentLetterDef) return;

        // Vẽ chữ đã hoàn thành nếu isLetterFullyCompleted là true
        if (isLetterFullyCompleted) {
            ctx.save();
            ctx.strokeStyle = FINAL_COMPLETED_LETTER_COLOR;
            ctx.lineWidth = OUTLINE_LINE_WIDTH; 
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            currentLetterDef.strokes.forEach(strokePoints => {
                if (strokePoints.length < 1) return;
                ctx.beginPath();
                ctx.moveTo(strokePoints[0].x, strokePoints[0].y);
                for (let i = 1; i < strokePoints.length; i++) ctx.lineTo(strokePoints[i].x, strokePoints[i].y);
                if (strokePoints.length === 1) { 
                    ctx.arc(strokePoints[0].x, strokePoints[0].y, OUTLINE_LINE_WIDTH / 2, 0, Math.PI * 2);
                    ctx.fillStyle = FINAL_COMPLETED_LETTER_COLOR; ctx.fill();
                } else ctx.stroke();
            });
            ctx.restore();
            return; // Không vẽ gì thêm nếu chữ đã hoàn thành
        }

        // Vẽ toàn bộ chữ cái mờ (nền)
        ctx.save();
        ctx.strokeStyle = LETTER_OUTLINE_COLOR;
        ctx.lineWidth = OUTLINE_LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        currentLetterDef.strokes.forEach(strokePoints => {
            if (strokePoints.length < 1) return;
            ctx.beginPath();
            ctx.moveTo(strokePoints[0].x, strokePoints[0].y);
            for (let i = 1; i < strokePoints.length; i++) ctx.lineTo(strokePoints[i].x, strokePoints[i].y);
            if (strokePoints.length === 1) {
                ctx.arc(strokePoints[0].x, strokePoints[0].y, OUTLINE_LINE_WIDTH / 2, 0, Math.PI * 2);
                ctx.fillStyle = LETTER_OUTLINE_COLOR; ctx.fill();
            } else ctx.stroke();
        });
        ctx.restore();

        // Vẽ đường nét đứt cho nét hiện tại
        ctx.save();
        if (currentLetterDef && currentStrokeIndex < currentLetterDef.strokes.length) {
            const strokeToTrace = currentLetterDef.strokes[currentStrokeIndex];
            if (strokeToTrace && strokeToTrace.length > 0) {
                ctx.strokeStyle = DASHED_LINE_COLOR; ctx.lineWidth = DASHED_LINE_WIDTH;
                ctx.setLineDash([8, 6]); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
                ctx.beginPath(); ctx.moveTo(strokeToTrace[0].x, strokeToTrace[0].y);
                for (let i = 1; i < strokeToTrace.length; i++) ctx.lineTo(strokeToTrace[i].x, strokeToTrace[i].y);
                ctx.stroke(); ctx.setLineDash([]);
            }
        }
        ctx.restore();

        // Vẽ các đoạn đã hoàn thành (fill)
        ctx.save();
        completedStrokeSegments.forEach(segment => {
            if (segment.length < 2) return;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.strokeStyle = TRACED_LINE_FILL_COLOR; ctx.lineWidth = OUTLINE_LINE_WIDTH * 0.95;
            ctx.beginPath(); ctx.moveTo(segment[0].x, segment[0].y); ctx.lineTo(segment[1].x, segment[1].y);
            ctx.stroke();
        });
        ctx.restore();

        // Vẽ nét người dùng đang tô
        ctx.save();
        if (isDrawing && userCurrentStrokePointsRef.current.length > 0) {
            const points = userCurrentStrokePointsRef.current;
            ctx.strokeStyle = USER_LINE_COLOR; ctx.lineWidth = USER_LINE_WIDTH;
            ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ctx.beginPath(); ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
            if (points.length === 1) { // Nếu chỉ có 1 điểm (click), vẽ một chấm tròn
                ctx.arc(points[0].x, points[0].y, USER_LINE_WIDTH / 2, 0, Math.PI * 2);
                ctx.fillStyle = USER_LINE_COLOR; ctx.fill();
            } else ctx.stroke();
        }
        ctx.restore();
        
        // Vẽ các điểm guide
        ctx.save();
        if (currentLetterDef && currentStrokeIndex < currentLetterDef.strokes.length) {
            const guidePoints = currentLetterDef.strokes[currentStrokeIndex];
            if (guidePoints) {
                guidePoints.forEach((point, index) => {
                    ctx.beginPath();
                    const isActive = index === nextExpectedPointIndex;
                    const isCompletedInCurrentStroke = index < nextExpectedPointIndex;
                    
                    let radius = GUIDE_DOT_RADIUS;
                    if (isActive) {
                        radius = (nextExpectedPointIndex === 0) ? INITIAL_ACTIVE_GUIDE_DOT_RADIUS : ACTIVE_GUIDE_DOT_RADIUS;
                    }
                    
                    let color = GUIDE_DOT_COLOR;
                    if (isActive) color = ACTIVE_GUIDE_DOT_COLOR;
                    else if (isCompletedInCurrentStroke) color = COMPLETED_GUIDE_DOT_COLOR;
                    
                    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2); 
                    ctx.fillStyle = color; 
                    ctx.fill();

                    // Logic đánh số (giữ nguyên như user cung cấp)
                    let pointNumberText = "";
                    if (index === 0) { 
                        pointNumberText = (currentStrokeIndex * 2 + 1).toString();
                    } else if (index === guidePoints.length - 1) { 
                        pointNumberText = (currentStrokeIndex * 2 + 2).toString();
                    }

                    if (pointNumberText) {
                        ctx.fillStyle = "black"; 
                        ctx.font = `${Math.max(radius * 0.7, 9)}px Arial`; 
                        ctx.textAlign = 'center'; 
                        ctx.textBaseline = 'middle';
                        ctx.fillText(pointNumberText, point.x, point.y);
                    }
                });
            }
        }
        ctx.restore();
    }, [currentLetterDef, completedStrokeSegments, currentStrokeIndex, nextExpectedPointIndex, drawOliGrid, isDrawing, isLetterFullyCompleted]);
    
    const loadLetter = useCallback((index: number) => {
        if (index < 0 || index >= ALPHABET_DATA.length) {
             console.warn("LoadLetter: Invalid letter index:", index); return;
        }
        setCurrentAlphabetIndex(index); 
        setCurrentLetterDef(ALPHABET_DATA[index]); 
        setCurrentStrokeIndex(0);
        setNextExpectedPointIndex(0);
        userCurrentStrokePointsRef.current = [];
        setCompletedStrokeSegments([]);
        setIsDrawing(false);
        setIsLetterFullyCompleted(false); 
        setToasts([]); // Xóa toast cũ khi load chữ mới
    }, []); // `setToasts` là stable từ `useState`, không cần thiết trong deps của `loadLetter`

    // Effect để khởi tạo canvas context và load chữ cái đầu tiên
    useEffect(() => {
        if (canvasRef.current && !canvasCtxRef.current) {
            canvasCtxRef.current = canvasRef.current.getContext('2d');
        }
        if (canvasCtxRef.current) { // Đảm bảo context đã sẵn sàng
             loadLetter(currentAlphabetIndex);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
    }, [currentAlphabetIndex]); // Chỉ chạy lại khi currentAlphabetIndex thay đổi, loadLetter đã được useCallback

    // Effect để vẽ lại scene khi các dependencies thay đổi
    useEffect(() => {
        // Không cần kiểm tra canvasCtxRef.current ở đây nữa vì drawScene đã làm điều đó
        drawScene();
    }, [drawScene]); // drawScene là dependency chính


    const getMouseOrTouchPos = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point | null => { 
        if (!canvasRef.current) return null;
        const rect = canvasRef.current.getBoundingClientRect();
        let clientX: number, clientY: number;

        if ('touches' in event) { // Touch event
            // Ưu tiên event.touches (khi đang chạm) hơn event.changedTouches (khi nhấc tay)
            const touch = event.touches.length > 0 ? event.touches[0] : event.changedTouches[0];
            if (!touch) return null; // Không có thông tin chạm
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else { // Mouse event
            clientX = event.clientX;
            clientY = event.clientY;
        }
        // Kiểm tra xem clientX và clientY có hợp lệ không (tránh trường hợp 0,0 khi không có touch)
        if (clientX === undefined || clientY === undefined) return null;

        return { x: clientX - rect.left, y: clientY - rect.top };
    }, []);
    
    const handleDrawingStart = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        event.preventDefault();
        if (isLetterFullyCompleted) return;
        if (!currentLetterDef || currentStrokeIndex >= currentLetterDef.strokes.length) return;
        
        const pos = getMouseOrTouchPos(event);
        if (!pos) return;

        const currentStrokeGuidePoints = currentLetterDef.strokes[currentStrokeIndex];
        if (!currentStrokeGuidePoints || currentStrokeGuidePoints.length === 0 || nextExpectedPointIndex >= currentStrokeGuidePoints.length) return;
        
        const targetPoint = currentStrokeGuidePoints[nextExpectedPointIndex];
        const clickTolerance = (nextExpectedPointIndex === 0) ? Math.max(START_TOLERANCE, INITIAL_ACTIVE_GUIDE_DOT_RADIUS + 5) : HIT_TOLERANCE;
        
        if (distanceToLineSegment(pos, targetPoint, targetPoint) < clickTolerance) {
            setIsDrawing(true); 
            userCurrentStrokePointsRef.current = [pos]; // Bắt đầu nét vẽ từ vị trí click/touch chính xác
            // Không cần gọi drawScene() ở đây vì useEffect [drawScene] sẽ tự động cập nhật khi isDrawing thay đổi
        }
       }, [currentLetterDef, currentStrokeIndex, nextExpectedPointIndex, getMouseOrTouchPos, isLetterFullyCompleted]); 
    
    const handleDrawingMove = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !currentLetterDef || isLetterFullyCompleted) return;
        event.preventDefault(); // Quan trọng để tránh cuộn trang trên mobile khi vẽ
        const pos = getMouseOrTouchPos(event);
        if (!pos) return;

        const currentStrokeGuidePoints = currentLetterDef.strokes[currentStrokeIndex];
        if (!currentStrokeGuidePoints || nextExpectedPointIndex >= currentStrokeGuidePoints.length) {
            setIsDrawing(false); 
            // drawScene() sẽ được gọi bởi useEffect
            return;
        }
        
        // Điểm tham chiếu để kiểm tra "lệch hướng": hoặc là điểm guide trước đó, hoặc là điểm người dùng bắt đầu vẽ
        const prevGuidePointOrUserStart = nextExpectedPointIndex === 0 
            ? (userCurrentStrokePointsRef.current[0] || currentStrokeGuidePoints[0]) // Điểm người dùng bắt đầu hoặc điểm guide đầu tiên
            : currentStrokeGuidePoints[nextExpectedPointIndex - 1]; // Điểm guide trước đó đã hoàn thành
        
        const targetPoint = currentStrokeGuidePoints[nextExpectedPointIndex];
        
        if (!prevGuidePointOrUserStart) { // Phòng trường hợp hiếm
             setIsDrawing(false); return;
        }

        const distToSegment = distanceToLineSegment(pos, prevGuidePointOrUserStart, targetPoint);
        
        // Nới lỏng dung sai lệch hướng một chút, đặc biệt cho điểm bắt đầu
        if (distToSegment > STRAY_TOLERANCE * (nextExpectedPointIndex === 0 && userCurrentStrokePointsRef.current.length < 2 ? 1.5 : 1.1) ) {
            setIsDrawing(false);
            userCurrentStrokePointsRef.current = []; // Xóa nét vẽ dở
            addToast("Vẽ hơi lệch! Hãy tô lại từ điểm sáng.", 'error');
            // drawScene() sẽ được gọi bởi useEffect
            return;
        }
        userCurrentStrokePointsRef.current.push(pos);
        
        // Kiểm tra xem có "hit" điểm target không
        if (distanceToLineSegment(pos, targetPoint, targetPoint) < HIT_TOLERANCE) {
            // Điểm bắt đầu của đoạn hoàn thành là điểm guide trước đó, hoặc điểm user bắt đầu nếu là điểm đầu tiên
            const segmentStartPoint = nextExpectedPointIndex === 0
                ? (userCurrentStrokePointsRef.current[0] || targetPoint) // Ưu tiên điểm user bắt đầu
                : currentStrokeGuidePoints[nextExpectedPointIndex - 1];

            setCompletedStrokeSegments(prev => [...prev, [segmentStartPoint, targetPoint]]);
            userCurrentStrokePointsRef.current = [targetPoint]; // Reset cho đoạn tiếp theo, bắt đầu từ điểm vừa chạm tới
            
            const newNextExpectedPointIndex = nextExpectedPointIndex + 1;
            setNextExpectedPointIndex(newNextExpectedPointIndex);

            if (newNextExpectedPointIndex >= currentStrokeGuidePoints.length) { // Hoàn thành nét hiện tại
                userCurrentStrokePointsRef.current = []; 
                setIsDrawing(false); 
                const newCurrentStrokeIndex = currentStrokeIndex + 1;
                setCurrentStrokeIndex(newCurrentStrokeIndex);
                setNextExpectedPointIndex(0); 
                if (newCurrentStrokeIndex >= currentLetterDef.strokes.length) { // Hoàn thành tất cả các nét của chữ
                    addToast("Tuyệt vời! Hoàn thành chữ!", 'success');
                    setIsLetterFullyCompleted(true);
                    setTimeout(() => {
                        // isLetterFullyCompleted sẽ tự động reset trong loadLetter khi chữ mới được load
                        setCurrentAlphabetIndex(prevIdx => (prevIdx + 1) % ALPHABET_DATA.length);
                    }, 1500); // Thời gian hiển thị chữ hoàn thành
                } else {
                    addToast("Chính xác! Tiếp tục nét sau.", 'info');
                }
            }
        }
        // Không cần gọi drawScene() ở đây, useEffect [drawScene] sẽ xử lý
    }, [isDrawing, currentLetterDef, currentStrokeIndex, nextExpectedPointIndex, getMouseOrTouchPos, addToast, isLetterFullyCompleted]);

    const handleDrawingEnd = useCallback((event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        // event.preventDefault(); // Có thể không cần thiết ở đây, nhưng giữ lại để nhất quán
        const wasDrawing = isDrawing;
        setIsDrawing(false); // Luôn dừng vẽ khi nhấc chuột/ chạm
      
        if (wasDrawing && userCurrentStrokePointsRef.current.length > 0 && currentLetterDef && !isLetterFullyCompleted) {
          const currentStrokeGuidePoints = currentLetterDef.strokes[currentStrokeIndex];
          if (currentStrokeGuidePoints && nextExpectedPointIndex < currentStrokeGuidePoints.length) {
            const lastUserPoint = userCurrentStrokePointsRef.current[userCurrentStrokePointsRef.current.length - 1];
            const nextTargetPoint = currentStrokeGuidePoints[nextExpectedPointIndex];
            // Nếu người dùng nhấc chuột/tay ra mà chưa chạm vào điểm tiếp theo (và không đủ gần),
            // thì coi như nét vẽ đó chưa hoàn thành, xóa nét đang vẽ dở.
            if (distanceToLineSegment(lastUserPoint, nextTargetPoint, nextTargetPoint) >= HIT_TOLERANCE) {
              userCurrentStrokePointsRef.current = [];
            }
            // Nếu họ nhấc chuột rất gần điểm target, logic "hit" trong handleDrawingMove đáng lẽ đã xử lý.
            // Nếu không, vẫn xóa nét dở nếu nó không chỉ là một điểm click.
            else if (userCurrentStrokePointsRef.current.length > 1) { 
                 userCurrentStrokePointsRef.current = [];
            }
          } else {
            // Đã hoàn thành tất cả các điểm của nét hiện tại hoặc không có điểm nào để vẽ
            userCurrentStrokePointsRef.current = [];
          }
        } else if (wasDrawing && userCurrentStrokePointsRef.current.length > 0) {
            // Các trường hợp khác mà isDrawing là true và có điểm vẽ dở (ví dụ: chữ đã hoàn thành)
            userCurrentStrokePointsRef.current = [];
        }
        // drawScene() sẽ được gọi bởi useEffect do isDrawing hoặc userCurrentStrokePointsRef thay đổi
      }, [isDrawing, currentLetterDef, currentStrokeIndex, nextExpectedPointIndex, isLetterFullyCompleted]);
        
    // Các hàm điều khiển (giữ nguyên)
    const handleNextLetter = useCallback(() => { 
        setCurrentAlphabetIndex(prevIdx => (prevIdx + 1) % ALPHABET_DATA.length);
    }, []);
    const handlePrevLetter = useCallback(() => {
        setCurrentAlphabetIndex(prevIdx => (prevIdx - 1 + ALPHABET_DATA.length) % ALPHABET_DATA.length);
       }, []);
    const handleResetLetter = useCallback(() => { 
        loadLetter(currentAlphabetIndex);
    }, [currentAlphabetIndex, loadLetter]);
    const handleSelectLetter = useCallback((char: string) => { 
        const index = ALPHABET_DATA.findIndex(def => def.character === char);
        if (index !== -1) {
            setCurrentAlphabetIndex(index);
        }
    }, []);
    
    // JSX (Đã loại bỏ <style jsx global>)
    return (
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-xl select-none w-full max-w-2xl mx-auto border-2 border-gray-200 relative">
            {/* Toast Container */}
            <div className="fixed top-5 right-5 z-50 flex flex-col space-y-2">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`px-6 py-3 rounded-lg shadow-md text-white text-sm font-medium flex items-center justify-between 
                                    ${toast.type === 'success' ? 'bg-green-500' : ''}
                                    ${toast.type === 'info' ? 'bg-blue-500' : ''}
                                    ${toast.type === 'error' ? 'bg-red-500' : ''}`}
                        style={{ 
                            minWidth: '250px', 
                            // Animation 'fadeInOut' sẽ được lấy từ tệp CSS toàn cục
                            animation: `fadeInOut ${toast.id === toasts[toasts.length-1]?.id ? 3 : 0.5}s ease-in-out forwards`
                        }}
                    >
                        <span>{toast.text}</span>
                        <button 
                            onClick={() => removeToast(toast.id)} 
                            className="ml-3 text-lg font-bold leading-none hover:text-gray-200 focus:outline-none"
                            aria-label="Close toast" // Thêm aria-label cho accessibility
                        >
                            &times;
                        </button>
                    </div>
                ))}
            </div>
            {/* Khối <style jsx global> đã được xóa */}

            <h1 className="text-3xl sm:text-5xl font-bold text-slate-700 mb-4 sm:mb-6">
                {currentLetterDef?.character || ''}
            </h1>
            <div className="relative p-0 rounded-lg shadow-inner bg-gray-50"> {/* Thêm màu nền nhẹ cho canvas container */}
                <canvas
                    ref={canvasRef}
                    width={400} 
                    height={400}
                    className="cursor-crosshair rounded-md border border-gray-300 touch-none" // Thêm touch-none để tránh cuộn trang khi vẽ trên mobile
                    onMouseDown={handleDrawingStart}
                    onMouseMove={handleDrawingMove}
                    onMouseUp={handleDrawingEnd}
                    onMouseLeave={handleDrawingEnd} // Quan trọng để dừng vẽ khi chuột rời canvas
                    onTouchStart={handleDrawingStart}
                    onTouchMove={handleDrawingMove}
                    onTouchEnd={handleDrawingEnd}
                    onTouchCancel={handleDrawingEnd} // Xử lý trường hợp touch bị hủy
                />
            </div>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center space-x-2 sm:space-x-3">
                <button onClick={handlePrevLetter} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-yellow-500 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-600 transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-400">Trước</button>
                <button onClick={handleResetLetter} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-red-500 text-white font-semibold rounded-lg shadow-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400">Xóa</button>
                <button onClick={handleNextLetter} className="px-4 py-2 sm:px-5 sm:py-2.5 bg-green-500 text-white font-semibold rounded-lg shadow-md hover:bg-green-600 transition-colors focus:outline-none focus:ring-2 focus:ring-green-400">Sau</button>
            </div>
            <div className="mt-6 sm:mt-8 flex flex-wrap justify-center gap-1.5 sm:gap-2 max-w-md sm:max-w-lg">
                {ALPHABET_DATA.map(letter => (
                    <button 
                        key={letter.character} 
                        onClick={() => handleSelectLetter(letter.character)} 
                        className={`w-9 h-9 sm:w-10 sm:h-10 font-bold text-lg sm:text-xl rounded-md shadow transition-all duration-150 ease-in-out focus:outline-none focus:ring-2
                                    ${currentLetterDef?.character === letter.character 
                                        ? 'bg-blue-500 text-white scale-110 ring-blue-300' 
                                        : 'bg-slate-100 text-blue-600 hover:bg-blue-100 hover:scale-105 focus:ring-blue-300'}`}
                    >
                        {letter.character}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default AlphabetTracerReactComponent;

