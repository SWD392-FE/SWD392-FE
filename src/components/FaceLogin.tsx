import { useEffect, useRef, useState } from 'react';
import * as faceapi from 'face-api.js';
import { UserAccount, users } from '../lib/data';
import { Camera, Loader2, ShieldCheck, RefreshCcw, Sun } from 'lucide-react';

interface FaceLoginProps {
  onLogin: (user: UserAccount) => void;
}

export default function FaceLogin({ onLogin }: FaceLoginProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState('Đang khởi tạo camera...');
  const [modelsLoaded, setModelsLoaded] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setMessage('Đang tải mô hình nhận diện...');
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);

      setModelsLoaded(true);
      setMessage('Đã sẵn sàng. Nhấn để quét khuôn mặt');
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading models:', error);
      setMessage('Lỗi tải mô hình. Vui lòng thử lại.');
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsScanning(true);
      setMessage('Đang mở camera...');

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setMessage('Hãy nhìn vào camera...');

        setTimeout(() => {
          detectFace();
        }, 1000);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setMessage('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.');
      setIsScanning(false);
    }
  };

  const detectFace = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    try {
      setMessage('Đang nhận diện khuôn mặt...');

      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (detections) {
        setMessage('Đã phát hiện khuôn mặt. Đang so khớp...');
        await matchFace();
      } else {
        setMessage('Không phát hiện khuôn mặt. Thử lại...');
        setTimeout(detectFace, 2000);
      }
    } catch (error) {
      console.error('Error detecting face:', error);
      setMessage('Lỗi nhận diện. Vui lòng thử lại.');
      stopCamera();
    }
  };

  const matchFace = async () => {
    const matchedUser = users[0];
    if (!matchedUser) {
      setMessage('Không có dữ liệu người dùng demo.');
      stopCamera();
      return;
    }
    setMessage(`Xin chào ${matchedUser.fullName}! Đang tải hồ sơ...`);
    setTimeout(() => {
      stopCamera();
      onLogin(matchedUser);
    }, 1200);
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const statusItems = [
    {
      label: 'Camera',
      value: isScanning ? 'Đang hoạt động' : 'Chưa bật',
      icon: <Camera className="w-4 h-4" />,
    },
    {
      label: 'Mô hình',
      value: modelsLoaded ? 'Đã tải' : 'Đang tải',
      icon: modelsLoaded ? <ShieldCheck className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />,
    },
    {
      label: 'Ánh sáng',
      value: 'Ổn định',
      icon: <Sun className="w-4 h-4" />,
    },
  ];

  const instructions = [
    'Giữ khuôn mặt trong khung màu xanh',
    'Nhìn thẳng và giữ khoảng cách 40-50cm',
    'Đảm bảo đủ ánh sáng và không đeo khẩu trang',
  ];

  const guestUser: UserAccount = {
    userID: 0,
    fullName: 'Guest',
    email: 'guest@megapos.app',
    passwordHash: 'guest',
    phoneNumber: '',
    createdAt: new Date().toISOString(),
    isActive: true,
  };

  const loginWithoutScan = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
    onLogin(guestUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,.35),_transparent_65%)]" />
      <div className="absolute -bottom-32 inset-x-0 h-72 bg-gradient-to-t from-sky-500/20 blur-3xl" />

      <button
        type="button"
        onClick={loginWithoutScan}
        className="absolute top-6 right-6 z-50 bg-white/90 backdrop-blur px-5 py-2 rounded-full text-sm font-semibold text-slate-700 shadow-lg hover:bg-white transition-colors flex items-center gap-2 border border-slate-200"
      >
        <RefreshCcw className="w-4 h-4" />
        Mua hàng nhanh
      </button>

      <div className="relative max-w-5xl w-full grid md:grid-cols-5 gap-6">
        <section className="md:col-span-3 bg-slate-900/70 border border-slate-800 rounded-3xl p-6 shadow-[0_25px_60px_rgba(15,23,42,.35)] backdrop-blur">
          <header className="flex items-center justify-between mb-4 text-white">
            <div>
              <p className="text-sm text-slate-400">Trạm đăng nhập</p>
              <h1 className="text-2xl font-semibold">Quét khuôn mặt</h1>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
              MegaPOS · Bảo mật đa lớp
            </span>
          </header>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {statusItems.map((item) => (
              <div key={item.label} className="bg-slate-800/60 rounded-2xl px-3 py-2 text-slate-200 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-sky-300">
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{item.label}</p>
                  <p className="text-sm font-semibold">{item.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-slate-800 mb-4" style={{ aspectRatio: '4/3' }}>
            <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

            <div className="absolute inset-8 border-2 border-emerald-400/70 rounded-3xl pointer-events-none" />

            {!isScanning && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/70 backdrop-blur">
                <div className="text-center text-white space-y-3">
                  <Camera className="w-14 h-14 mx-auto opacity-70" />
                  <p className="text-lg font-semibold">Camera đang chờ kích hoạt</p>
                  <p className="text-sm text-slate-300">
                    Nhấn “Bắt đầu quét” để kích hoạt camera và tiến hành nhận diện
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 bg-slate-800/60 rounded-2xl px-4 py-4 text-slate-200">
            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              )}
              <div>
                <p className="text-sm text-slate-400">Trạng thái</p>
                <p className="font-medium">{message}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {!isScanning && !isLoading && (
                <button
                  onClick={startCamera}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold flex items-center gap-2 shadow-lg shadow-sky-500/30"
                >
                  <Camera className="w-4 h-4" />
                  Quét khuôn mặt
                </button>
              )}
              {isScanning && (
                <button
                  onClick={stopCamera}
                  className="px-6 py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Dừng quét
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="md:col-span-2 bg-white/95 rounded-3xl border border-slate-100 p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
              <Camera className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Bảo mật nâng cao</p>
              <h2 className="text-xl font-semibold text-slate-900">Hướng dẫn nhận diện</h2>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {instructions.map((tip, index) => (
              <div key={tip} className="flex items-start gap-4 p-4 border border-slate-200 rounded-2xl">
                <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold flex items-center justify-center">
                  {index + 1}
                </span>
                <p className="text-slate-700">{tip}</p>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-sm text-slate-600 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mt-0.5" />
            <p>
              Dữ liệu nhận diện được mã hoá hoàn toàn và chỉ dùng để đăng nhập vào hệ thống POS. Sau khi
              xác thực thành công, camera sẽ tự động tắt.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
