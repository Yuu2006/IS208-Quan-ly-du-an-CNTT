import { useState, useEffect } from 'react';
import { Calendar, Tag, MapPin, Truck, CheckCircle2, User, Package, Clock, BarChart3, X, Leaf, FileText, History, ShieldCheck, Box, Navigation, AlertCircle } from "lucide-react";
import { api } from "../../config/api";
import { SearchBar } from '../../components/common/SearchBar';

export function ShippingScreen({ data, targetShipmentId }: { data: any, targetShipmentId?: string | null }) {
  const [shipmentRows, setShipmentRows] = useState(data.shipments);
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [showCertModal, setShowCertModal] = useState(false);

  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [detailTab, setDetailTab] = useState<'shipping' | 'origin'>('shipping');
  const [activeCheckpoint, setActiveCheckpoint] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [areaFilter, setAreaFilter] = useState('Tất cả khu vực');
  const [dateFilter, setDateFilter] = useState('Tất cả');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);

  /** Chuẩn hóa mã chuyến xe thành mã lô hàng để tránh lỗi khi dữ liệu thiếu id. */
  const getBatchCode = (shipment: any) => {
    const shipmentCode = String(shipment?.id ?? shipment?.title ?? '');
    return shipmentCode ? shipmentCode.replace('TRK', 'BATCH') : 'Chưa cập nhật';
  };

  const isCreatedBatchStatus = (status?: string) => {
    const normalizedStatus = String(status ?? '').trim();
    return ['CREATED', 'Sẵn sàng', 'Chờ xử lý', 'Đang chuẩn bị', 'Chưa vận chuyển', 'Mới tạo', 'Chờ vận chuyển', 'Chờ lấy hàng'].includes(normalizedStatus);
  };

  const canModifyShipment = (shipment?: any) => {
    if (!shipment) return false;
    const isCancelled = shipment.tone === 'locked' || shipment.status === 'Đã khóa' || shipment.status === 'Hủy bỏ' || shipment.status === 'Đã hủy';
    return !isCancelled && isCreatedBatchStatus(shipment.status);
  };

  // Mock data bổ sung cho Nguồn gốc và Hành trình (Gắn vào selectedShipment)
  const mockTraceability: any = {
    'active': {
      productName: 'Rau mầm hữu cơ',
      farmName: 'Nông trại Xanh Đà Lạt',
      farmAddress: '123 Đường Vòng Lâm Viên, Phường 8, Đà Lạt, Lâm Đồng',
      certCode: 'VietGAP-12345',
      farmingMethod: 'Hữu cơ 100%, không sử dụng thuốc trừ sơ hóa học',
      harvestDate: '02/05/2026',
      packDate: '03/05/2026',
      quantity: '500 kg',
      history: [
        {
          id: 1,
          date: '02/05/2026 08:00',
          title: 'Khởi tạo lô hàng',
          actor: 'Nông trại Xanh Đà Lạt',
          description: 'Nông trại thu hoạch và khởi tạo lô hàng rau mầm hữu cơ.',
          type: 'farm',
          icon: Leaf,
          color: 'bg-emerald-100 text-emerald-600',
          completed: true
        },
        {
          id: 2,
          date: '03/05/2026 10:30',
          title: 'Xác nhận chứng chỉ',
          actor: 'Hệ thống kiểm định',
          description: 'Hệ thống tự động xác nhận lô hàng đạt chuẩn VietGAP-12345.',
          type: 'cert',
          icon: FileText,
          color: 'bg-blue-100 text-blue-600',
          completed: true
        },
        {
          id: 3,
          date: '03/05/2026 15:00',
          title: 'Đơn vị vận chuyển tiếp nhận',
          actor: 'Giao Hàng Nhanh',
          description: 'Tiếp nhận lô hàng tại điểm thu gom Đà Lạt. Bắt đầu vận chuyển.',
          type: 'transit',
          icon: Truck,
          color: 'bg-amber-100 text-amber-600',
          completed: true
        },
        {
          id: 4,
          date: '04/05/2026 09:15',
          title: 'Đang vận chuyển',
          actor: 'Kho trung chuyển',
          description: 'Lô hàng đang trong quá trình di chuyển.',
          type: 'transit',
          icon: CheckCircle2,
          color: 'bg-emerald-100 text-emerald-600',
          completed: true
        },
        {
          id: 5,
          date: 'Dự kiến 05/05/2026',
          title: 'Cửa hàng xác nhận',
          actor: 'Cửa hàng đích',
          description: 'Đợi xác nhận giao hàng và nhập kho tại điểm cuối.',
          type: 'store',
          icon: Box,
          color: 'bg-slate-100 text-slate-400',
          completed: false
        }
      ]
    },
    'error': {
      productName: 'Dâu tây Đà Lạt',
      farmName: 'Nông trại SunFarm',
      farmAddress: '456 Đường Lê Hồng Phong, Đà Lạt',
      certCode: 'VietGAP-999',
      farmingMethod: 'Thủy canh',
      harvestDate: '01/05/2026',
      packDate: '01/05/2026',
      quantity: '200 kg',
      history: [
        {
          id: 1,
          date: '01/05/2026 07:00',
          title: 'Khởi tạo lô hàng',
          actor: 'Nông trại SunFarm',
          description: 'Khởi tạo lô hàng dâu tây.',
          type: 'farm',
          icon: Leaf,
          color: 'bg-emerald-100 text-emerald-600',
          completed: true
        },
        {
          id: 2,
          date: '01/05/2026 14:00',
          title: 'Lô hàng bị hủy',
          actor: 'Quản trị viên',
          description: 'Lý do hủy: Lô hàng không đạt chuẩn chất lượng sau khi kiểm tra.',
          type: 'error',
          icon: AlertCircle,
          color: 'bg-red-100 text-red-600',
          completed: true
        }
      ]
    }
  };

  const handleSelectMockShipment = (shipment: any) => {
    const isCancelled = shipment.tone === 'locked' || shipment.status === 'Đã hủy' || shipment.status === 'Hủy bỏ';
    const statusText = isCancelled ? 'Đã hủy' : shipment.status;
    const toneValue = isCancelled ? 'locked' : shipment.tone;

    const traceData = isCancelled ? mockTraceability.error : mockTraceability.active;

    // Nâng cấp checkpoint data
    const enhancedCheckpoints = data.selected.checkpoints.map((cp: any, idx: number) => ({
      ...cp,
      sequence: idx + 1,
      location: cp.name,
      updatedBy: cp.actor || 'Hệ thống',
      details: idx === 2 ? 'Cảnh báo nhiệt độ tăng nhẹ nhưng vẫn trong ngưỡng an toàn.' : (idx === data.selected.checkpoints.length - 1 ? 'Đã giao hàng thành công. Kèm hình ảnh đối soát.' : 'Thông số an toàn.'),
      images: idx === data.selected.checkpoints.length - 1 ? [
        'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=300&h=200',
        'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=300&h=200'
      ] : []
    }));

    setSelectedShipment({
      ...data.selected,
      title: shipment.id,
      subtitle: shipment.route,
      status: statusText,
      tone: toneValue,
      traceability: traceData,
      checkpoints: enhancedCheckpoints,
      currentIndex: isCancelled ? 1 : (shipment.id === 'BF-TRK-1202' ? 2 : (shipment.status === 'Đã giao' ? enhancedCheckpoints.length - 1 : 1))
    });
    setDetailTab('shipping');
    setActiveCheckpoint(null);
  };

  useEffect(() => {
    if (targetShipmentId) {
      // Tìm lô hàng trong danh sách hoặc tạo mock dựa trên mã LOT truyền sang từ Reports
      const existing = data.shipments.find((s: any) => s.id === targetShipmentId);
      if (existing) {
        handleSelectMockShipment(existing);
      } else {
        const mockShipment = {
          id: targetShipmentId.replace('LOT', 'TRK'), // Chuyển đổi mã lô thành mã chuyến xe
          route: "Đà Lạt - HCM",
          status: "Đang vận chuyển",
          eta: "2h 10p",
          tone: "active"
        };
        handleSelectMockShipment(mockShipment);
      }
    }
  }, [targetShipmentId]);

  const loadData = async () => {
    try {
      const [{ data: batchesData }, { data: transportsData }] = await Promise.all([
        api.get("/batches"),
        api.get("/transports")
      ]);

      const getVietnameseStatus = (status: string) => {
        if (status === "ARRIVED_WAREHOUSE") return "ÄÃ£ Ä‘áº¿n kho";
        switch(status) {
          case "CREATED": return "Mới tạo";
          case "AT_WAREHOUSE": return "Chờ vận chuyển";
          case "IN_TRANSIT": return "Đang vận chuyển";
          case "ARRIVED": return "Đã đến kho";
          case "DELIVERED": return "Đã giao";
          case "CANCELLED": return "Đã hủy";
          case "PENDING_PICKUP": return "Chờ lấy hàng";
          default: return status;
        }
      };

      const getTone = (status: string) => {
        if (status === "ARRIVED_WAREHOUSE") return "active";
        if (status === "DELIVERED") return "success";
        if (["IN_TRANSIT", "ARRIVED", "AT_WAREHOUSE", "PENDING_PICKUP"].includes(status)) return "active";
        if (["CANCELLED"].includes(status)) return "locked";
        return "neutral";
      };

      const rows = batchesData.map((batch: any) => {
         const transport = transportsData.find((t: any) => t.batch?.batchId === batch.batchId);
         if (transport) {
            return {
               id: "BF-TRK-" + String(transport.transportId).padStart(4, "0"),
               title: "BF-TRK-" + String(transport.transportId).padStart(4, "0"),
               batchCode: batch.batchCode,
               route: `${transport.shipperPartner?.partnerName ?? "N/A"} - ${transport.receiverPartner?.partnerName ?? "N/A"}`,
               status: getVietnameseStatus(transport.transportStatus),
               eta: transport.expectedArrival ? new Date(transport.expectedArrival).toLocaleDateString("vi-VN") : "--",
               tone: getTone(transport.transportStatus),
               transport,
               batch,
               partner: transport.transporterPartner?.partnerName || "Chưa phân công"
            };
         } else {
            return {
               id: batch.batchCode,
               title: batch.batchCode,
               batchCode: batch.batchCode,
               route: "Chưa có lộ trình",
               status: getVietnameseStatus(batch.status),
               eta: "--",
               tone: getTone(batch.status),
               batch,
               partner: "N/A"
            };
         }
      });
      setShipmentRows(rows);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectShipment = async (shipment: any) => {
    try {
      const batchStatus = shipment.batch?.status;
      const transportStatus = shipment.transport?.transportStatus;

      const history = [
        {
          id: 1,
          date: shipment.batch?.createdAt ? new Date(shipment.batch.createdAt).toLocaleString("vi-VN") : "--",
          title: "Khởi tạo lô hàng",
          actor: shipment.batch?.farmPartner?.partnerName || "Nông trại",
          description: "Lô hàng được khởi tạo.",
          type: "farm",
          icon: Leaf,
          color: "bg-emerald-100 text-emerald-600",
          completed: true
        },
        {
          id: 2,
          date: shipment.batch?.certificates?.length > 0 ? "Đã xác nhận" : "--",
          title: "Xác nhận chứng chỉ",
          actor: "Hệ thống kiểm định",
          description: "Xác nhận lô hàng đạt chuẩn.",
          type: "cert",
          icon: FileText,
          color: "bg-blue-100 text-blue-600",
          completed: shipment.batch?.certificates?.length > 0
        },
        {
          id: 3,
          date: shipment.transport?.createdAt ? new Date(shipment.transport.createdAt).toLocaleString("vi-VN") : "--",
          title: "Đơn vị vận chuyển tiếp nhận",
          actor: shipment.partner || "Đơn vị VC",
          description: "Tiếp nhận lô hàng tại điểm thu gom.",
          type: "transit",
          icon: Truck,
          color: "bg-amber-100 text-amber-600",
          completed: !!shipment.transport
        },
        {
          id: 4,
          date: shipment.transport?.actualDeparture ? new Date(shipment.transport.actualDeparture).toLocaleString("vi-VN") : "--",
          title: "Đang vận chuyển",
          actor: "Tài xế",
          description: "Lô hàng đang trong quá trình di chuyển.",
          type: "transit",
          icon: CheckCircle2,
          color: "bg-emerald-100 text-emerald-600",
          completed: ["IN_TRANSIT", "ARRIVED", "DELIVERED"].includes(transportStatus)
        },
        {
          id: 5,
          date: shipment.transport?.actualArrival ? new Date(shipment.transport.actualArrival).toLocaleString("vi-VN") : "Dự kiến " + (shipment.eta !== "--" ? shipment.eta : "--"),
          title: "Cửa hàng xác nhận",
          actor: shipment.batch?.storePartner?.partnerName || "Cửa hàng đích",
          description: "Xác nhận giao hàng và nhập kho.",
          type: "store",
          icon: Box,
          color: "bg-slate-100 text-slate-400",
          completed: transportStatus === "DELIVERED" || batchStatus === "DELIVERED"
        }
      ];

      const traceData = {
         productName: shipment.batch?.productName ?? "N/A",
         farmName: shipment.batch?.farmPartner?.partnerName || "N/A",
         farmAddress: shipment.batch?.farmPartner?.address || "N/A",
         certCode: shipment.batch?.certificates?.[0]?.certificate?.certType || "Chưa có",
         farmingMethod: "Hữu cơ",
         harvestDate: shipment.batch?.harvestDate ? new Date(shipment.batch.harvestDate).toLocaleDateString("vi-VN") : "N/A",
         packDate: shipment.batch?.packagedDate ? new Date(shipment.batch.packagedDate).toLocaleDateString("vi-VN") : "N/A",
         quantity: `${shipment.batch?.quantity ?? 0} kg`,
         history
      };

      const checkpoints = shipment.transport?.checkpoints?.map((cp: any) => ({
         ...cp,
         sequence: cp.sequence,
         location: cp.locationName || `Trạm kiểm tra số ${cp.sequence}`,
         time: cp.reportedAt ? new Date(cp.reportedAt).toLocaleString("vi-VN") : "Chưa cập nhật",
         temperature: cp.temperature ? `${cp.temperature}°C` : "N/A",
         updatedBy: "Hệ thống",
         details: cp.note || "Thông số bình thường",
         images: []
      })) || [];

      setSelectedShipment({
        ...shipment,
        subtitle: shipment.route,
        traceability: traceData,
        checkpoints: checkpoints,
        currentIndex: checkpoints.length > 0 ? checkpoints.length - 1 : 0
      });
      setDetailTab("shipping");
      setActiveCheckpoint(null);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (targetShipmentId && shipmentRows.length > 0) {
      const existing = shipmentRows.find((s: any) => s.id === targetShipmentId);
      if (existing) {
        handleSelectShipment(existing);
      }
    }
  }, [targetShipmentId, shipmentRows]);

  const filteredShipments = shipmentRows.filter((shipment: any) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || [
      shipment.id,
      shipment.title,
      shipment.batchCode,
      shipment.route,
      shipment.status,
      shipment.partner,
      shipment.transport?.driverName,
      shipment.transport?.licensePlate,
      shipment.transport?.shipperPartner?.partnerName,
      shipment.transport?.receiverPartner?.partnerName,
      shipment.batch?.productName,
      shipment.batch?.productType,
      shipment.batch?.farmPartner?.partnerName
    ].some((value) => String(value ?? '').toLowerCase().includes(searchLower));
      
    // Logic for Status Filter with grouping
    let matchesStatus = true;
    if (statusFilter !== "Tất cả trạng thái") {
      if (statusFilter === "Mới tạo") {
        matchesStatus = ["Mới tạo", "Chờ vận chuyển", "Chờ lấy hàng"].includes(shipment.status);
      } else if (statusFilter === "Đang vận chuyển") {
        matchesStatus = ["Đang vận chuyển", "Đã đến kho"].includes(shipment.status);
      } else if (statusFilter === "Đã giao") {
        matchesStatus = shipment.status === "Đã giao";
      } else if (statusFilter === "Đã hủy") {
        matchesStatus = ["Đã hủy", "Hủy bỏ", "Đã khóa"].includes(shipment.status) || shipment.tone === "locked";
      }
    }

    // Logic for Area Filter
    let matchesArea = true;
    if (areaFilter !== "Tất cả khu vực") {
      const addressString = `${shipment.batch?.farmPartner?.address || ""} ${shipment.transport?.receiverPartner?.address || ""} ${shipment.route || ""}`.toLowerCase();
      if (areaFilter === "Miền Bắc") {
        matchesArea = ["hà nội", "hải phòng", "quảng ninh", "bắc ninh", "hà giang", "hải dương", "hưng yên", "thái bình"].some(p => addressString.includes(p));
      } else if (areaFilter === "Miền Trung") {
        matchesArea = ["đà nẵng", "huế", "quảng nam", "quảng ngãi", "nghệ an", "hà tĩnh", "thanh hóa", "bình định", "phú yên", "khánh hòa", "nha trang"].some(p => addressString.includes(p));
      } else if (areaFilter === "Miền Nam") {
        matchesArea = ["hồ chí minh", "hcm", "sài gòn", "bình dương", "đồng nai", "cần thơ", "đà lạt", "lâm đồng", "long an", "tiền giang", "vũng tàu"].some(p => addressString.includes(p));
      }
    }

    // Logic for Date Filter
    let matchesDate = true;
    if (dateFilter !== "Tất cả") {
      const createdAt = new Date(shipment.batch?.createdAt || shipment.transport?.createdAt || '');
      const now = new Date();
      if (Number.isNaN(createdAt.getTime()) || createdAt > now) return false;
      const diffTime = now.getTime() - createdAt.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (dateFilter === "Hôm nay") {
        matchesDate = diffDays <= 1;
      } else if (dateFilter === "7 ngày qua") {
        matchesDate = diffDays <= 7;
      } else if (dateFilter === "30 ngày qua") {
        matchesDate = diffDays <= 30;
      }
    }

    return matchesSearch && matchesStatus && matchesArea && matchesDate;
  });

  const canModifySelectedShipment = canModifyShipment(selectedShipment);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Quản lý lô hàng & vận chuyển</h1>
          <p className="text-slate-500 mt-1">Theo dõi lô hàng, nguồn gốc, QR truy xuất và hành trình vận chuyển trong chuỗi cung ứng.</p>
        </div>
        
      </header>

      {/* Shipping Filters */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[250px]">
          <SearchBar placeholder="Tìm mã lô hàng, mã vận đơn, tài xế, nhà cung cấp..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="hidden lg:block w-px h-8 bg-slate-200 mx-1"></div>

        <div className="relative min-w-[150px]">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Hôm nay</option>
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>Tất cả</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <Tag size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả trạng thái</option>
            <option>Mới tạo</option>
            <option>Đang vận chuyển</option>
            <option>Đã giao</option>
            <option>Đã hủy</option>
          </select>
        </div>

        <div className="relative min-w-[150px]">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select value={areaFilter} onChange={(e) => setAreaFilter(e.target.value)} className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-sage-500 outline-none transition-all appearance-none cursor-pointer hover:bg-slate-100 font-medium text-slate-600">
            <option>Tất cả khu vực</option>
            <option>Miền Bắc</option>
            <option>Miền Trung</option>
            <option>Miền Nam</option>
          </select>
        </div>
      </div>

      <div className="flex items-start gap-6 relative">
        {/* Shipment List */}
        <div className={`transition-all duration-300 ${selectedShipment ? 'w-1/3' : 'w-full'} flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar`}>
          {filteredShipments.map((shipment: any) => {
            const isCancelled = shipment.tone === 'locked' || shipment.status === 'Đã khóa' || shipment.status === 'Hủy bỏ' || shipment.status === 'Đã hủy';
            const statusLabel = isCancelled ? 'Đã hủy' : shipment.status;

            return (
              <div
                key={shipment.id}
                onClick={() => handleSelectShipment(shipment)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedShipment?.title === shipment.id ? 'bg-sage-50 border-sage-300 shadow-md ring-1 ring-sage-300' : 'bg-white border-slate-200 hover:border-sage-300 hover:shadow-sm'}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-bold text-slate-800 text-lg leading-tight">{shipment.id}</div>
                    <div className="text-[11px] font-medium text-slate-500 mt-1">
                      Mã lô hàng: <span className="text-sage-600 font-bold">{shipment.id.replace('TRK', 'BATCH')}</span>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isCancelled ? 'bg-red-100 text-red-700' :
                    (shipment.tone === 'active' ? 'bg-cyan-100 text-cyan-700' : shipment.tone === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')
                    }`}>
                    {statusLabel}
                  </span>
                </div>
                <div className="text-sm text-slate-600 mb-3">{shipment.route}</div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                  <Clock size={14} /> ETA: {isCancelled ? '--' : shipment.eta}
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Integrated Panel */}
        {selectedShipment && (
          <div className="w-2/3 flex flex-col gap-0 animate-in slide-in-from-right-8 duration-300 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Panel Header */}
            <div className="p-6 pb-4 relative overflow-hidden bg-slate-50 border-b border-slate-100">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sage-100 rounded-bl-full -z-10 opacity-50"></div>

              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">{selectedShipment.title}</h2>
                  <p className="text-slate-500 font-medium">{selectedShipment.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold shadow-sm border ${selectedShipment.status === 'Đã hủy' ? 'bg-red-100 text-red-700 border-red-200' :
                    (selectedShipment.tone === 'active' ? 'bg-cyan-100 text-cyan-700 border-cyan-200' :
                      selectedShipment.tone === 'ok' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        'bg-amber-100 text-amber-700 border-amber-200')
                    }`}>
                    {selectedShipment.status}
                  </span>
                  {canModifySelectedShipment && (
                    <button onClick={() => setShowCancelModal(true)} className="px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-200 shadow-sm flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Hủy lô hàng
                    </button>
                  )}
                  <button onClick={() => setSelectedShipment(null)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Internal Tabs */}
              <div className="flex gap-2 bg-white p-1.5 rounded-xl border border-slate-200 w-fit shadow-sm">
                <button
                  onClick={() => setDetailTab('shipping')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-all ${detailTab === 'shipping' ? 'bg-sage-100 text-sage-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Truck size={16} /> Vận chuyển
                </button>
                <button
                  onClick={() => setDetailTab('origin')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-extrabold transition-all ${detailTab === 'origin' ? 'bg-sage-100 text-sage-700' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Leaf size={16} /> Nguồn gốc & QR
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[650px] overflow-y-auto custom-scrollbar bg-white">
              {detailTab === "shipping" && (
                (selectedShipment.status === 'Chờ xử lý' || selectedShipment.status === 'Đang chuẩn bị' || selectedShipment.status === 'Chưa vận chuyển') ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-300 h-[600px]">
                    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mb-4 border-4 border-white shadow-sm">
                      <Truck size={36} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Chưa có đơn vận chuyển</h3>
                    <p className="text-sm text-slate-500 mb-6 max-w-md leading-relaxed">
                      Lô hàng này đã sẵn sàng nhưng chưa được điều phối vận chuyển. Vui lòng tạo đơn để đối tác có thể tiếp nhận và bắt đầu hành trình.
                    </p>
                    
                  </div>
                ) : (
                <div className="animate-in fade-in duration-300 space-y-6">
                  {/* Summary Header Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-emerald-600"><Package size={20} /></div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider truncate">Mã lô hàng</div>
                        <div className="text-sm font-bold text-slate-800 truncate">{getBatchCode(selectedShipment)}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-500"><Truck size={20} /></div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider truncate">Đối tác VC</div>
                        <div className="text-sm font-bold text-slate-800 truncate">{selectedShipment.partner || 'Giao Hàng Nhanh'}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-sage-600"><User size={20} /></div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider truncate">Tài xế</div>
                        <div className="text-sm font-bold text-slate-800 truncate">{selectedShipment.transport?.driverName || 'Chưa phân công'}</div>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-amber-500"><Truck size={20} /></div>
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase text-slate-400 font-bold tracking-wider truncate">Phương tiện</div>
                        <div className="text-sm font-bold text-slate-800 truncate">{selectedShipment.transport?.licensePlate || '--'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Integrated Lifecycle & Detailed Checkpoints (Left) */}
                    <div className="w-full lg:w-1/3 space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                      <div className="space-y-6">
                        {/* High-level Lifecycle Overview */}
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Quy trình chuỗi cung ứng</h3>
                          <div className="flex justify-between relative px-2">
                            <div className="absolute top-3 left-4 right-4 h-[2px] bg-slate-200"></div>
                            {selectedShipment.traceability.history.map((step: any, idx: number) => (
                              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step.completed ? 'bg-sage-600 text-white shadow-sm ring-4 ring-sage-50' : 'bg-slate-200 text-slate-400'}`}>
                                  {idx + 1}
                                </div>
                                <span className={`text-[9px] font-bold text-center max-w-[60px] ${step.completed ? 'text-sage-700' : 'text-slate-400'}`}>
                                  {step.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Detailed Transit Timeline */}
                        <div className="space-y-6">
                          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                            <History size={14} /> Nhật ký vận chuyển chi tiết
                          </h3>
                          <div className="relative pl-4 space-y-6">
                            <div className="absolute left-[7px] top-2 bottom-2 w-[1px] bg-slate-100"></div>

                            {selectedShipment.checkpoints.map((cp: any, idx: number) => {
                              const isCompleted = idx <= selectedShipment.currentIndex;
                              const isActive = activeCheckpoint === idx;
                              const isLast = idx === selectedShipment.checkpoints.length - 1;

                              return (
                                <div key={idx} className="relative">
                                  {isCompleted && !isLast && (
                                    <div className="absolute left-[7px] top-3 h-12 w-[1px] bg-sage-400 z-10"></div>
                                  )}

                                  <div
                                    onClick={() => isCompleted && setActiveCheckpoint(isActive ? null : idx)}
                                    className={`flex gap-4 group cursor-pointer transition-all ${isCompleted ? 'opacity-100' : 'opacity-40'}`}
                                  >
                                    <div className={`relative z-20 w-4 h-4 rounded-full mt-1 border-2 transition-all duration-300 ${isCompleted ? 'bg-white border-sage-500 ring-4 ring-sage-50' : 'bg-white border-slate-200'}`}>
                                      {isCompleted && <div className="absolute inset-0.5 bg-sage-600 rounded-full animate-in fade-in zoom-in"></div>}
                                    </div>

                                    <div className="flex-1">
                                      <div className="flex items-center justify-between gap-2 mb-0.5">
                                        <h4 className={`text-sm font-bold ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{cp.location}</h4>
                                        <span className="text-[10px] font-bold text-slate-400 shrink-0">{cp.time}</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-bold mt-1">
                                        <span className={`px-2 py-0.5 rounded-md ${cp.temperature.includes('8.5') ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                          {cp.temperature.includes('8.5') ? 'Cảnh báo' : 'Bình thường'}
                                        </span>
                                        <span className={`${cp.temperature.includes('8.5') ? 'text-red-500' : 'text-sage-600'}`}>{cp.temperature}</span>
                                        <span className="text-slate-300">|</span>
                                        <span className="text-slate-500">{cp.updatedBy}</span>
                                      </div>

                                      {isActive && cp.images && cp.images.length > 0 && (
                                        <div className="mt-4 p-3 bg-slate-100/50 rounded-2xl border border-slate-200 animate-in slide-in-from-top-2 duration-300">
                                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ảnh xác thực</div>
                                          <div className="grid grid-cols-2 gap-2">
                                            {cp.images.map((img: string, i: number) => (
                                              <div key={i} className="aspect-video rounded-xl overflow-hidden border border-slate-300">
                                                <img src={img} alt="Verification" className="w-full h-full object-cover" />
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Modern Path Map (Right) */}
                    <div className="w-full lg:w-2/3 space-y-4 h-full">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hành trình chi tiết (Local Map)</h3>
                        <div className="flex items-center gap-4 px-3 py-1.5 bg-white/90 backdrop-blur-md text-slate-800 rounded-xl border border-slate-200 shadow-md">
                          <span className="font-mono text-sm font-semibold tracking-tight">11.9404°N | 108.4583°E</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">LIVE</span>
                          </div>
                        </div>
                      </div>

                      <div className="w-full bg-slate-50 rounded-[2rem] overflow-hidden relative h-[480px] shadow-xl border border-slate-200 flex items-center justify-center">
                        {/* Map Background Image - Local Street Style */}
                        <img
                          src="https://images.unsplash.com/photo-1569336415962-a4bd9f6dfc0f?q=80&w=2000&auto=format&fit=crop"
                          alt="Local Street Map"
                          className="absolute inset-0 w-full h-full object-cover opacity-60 grayscale-[0.2] contrast-[1.1] hover:opacity-80 transition-opacity duration-700"
                        />
                        <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>

                        {/* Styled Path Pattern */}
                        <div className="absolute inset-0">
                          <svg className="w-full h-full" viewBox="0 0 400 400">
                            {/* Route Path - Completed (Solid Green) */}
                            <path d="M50,350 L120,280 L200,290 L280,200" fill="none" stroke="#10b981" strokeWidth="6" strokeLinecap="round" className="drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]" />

                            {/* Route Path - Remaining (Dashed Slate) */}
                            <path d="M280,200 L320,150 L350,50" fill="none" stroke="#94a3b8" strokeWidth="4" strokeDasharray="8,12" strokeLinecap="round" className="opacity-60" />

                            {/* Checkpoint Markers on Path */}
                            <circle cx="50" cy="350" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                            <circle cx="120" cy="280" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                            <circle cx="200" cy="290" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                            <circle cx="280" cy="200" r="5" fill="#10b981" stroke="white" strokeWidth="2" />
                            <circle cx="350" cy="50" r="5" fill="white" stroke="#10b981" strokeWidth="2" />
                          </svg>
                        </div>

                        {/* Real-time Truck Marker */}
                        <div className="absolute top-[50%] left-[70%] -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-50 duration-700 z-30">
                          <div className="relative">
                            <div className="absolute -inset-8 bg-emerald-500/20 rounded-full animate-ping duration-[2500ms]"></div>
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl border-2 border-emerald-500 flex items-center justify-center text-emerald-600 transition-transform hover:scale-110 cursor-pointer">
                              <Truck size={24} />
                            </div>
                            <div className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-sm text-slate-800 text-[11px] font-bold px-3 py-2 rounded-xl shadow-lg whitespace-nowrap border border-slate-100">
                              Đang di chuyển · 72km/h
                              <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-slate-100 rotate-45"></div>
                            </div>
                          </div>
                        </div>

                        {/* Subtle Floating Controls */}
                        <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-40">
                          <button className="w-12 h-12 bg-white/90 backdrop-blur shadow-lg rounded-2xl flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 group">
                            <Navigation size={20} className="group-hover:text-emerald-500 transition-colors" />
                          </button>
                          <button className="w-12 h-12 bg-white/90 backdrop-blur shadow-lg rounded-2xl flex items-center justify-center border border-slate-200 hover:bg-slate-50 transition-all text-slate-600 group">
                            <BarChart3 size={20} className="group-hover:text-emerald-500 transition-colors" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                )
              )}

              {detailTab === 'origin' && (
                <div className="animate-in fade-in duration-300">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-5">

                    {/* Batch Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                        <Box size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Mã lô hàng truy xuất</div>
                        <div className="text-lg font-bold text-slate-800 tracking-tight font-mono">{getBatchCode(selectedShipment)}</div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-200"></div>

                    {/* Basic Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <Leaf size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sản phẩm & Phương thức</div>
                        <div className="text-lg font-bold text-slate-800">{selectedShipment.traceability.productName}</div>
                        <div className="text-sm text-slate-600 mt-0.5">{selectedShipment.traceability.farmingMethod}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Khối lượng</div>
                        <div className="text-xl font-black text-sage-600">{selectedShipment.traceability.quantity}</div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-200"></div>

                    {/* Farm Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nơi sản xuất</div>
                        <div className="text-base font-bold text-slate-800">{selectedShipment.traceability.farmName}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{selectedShipment.traceability.farmAddress}</div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-200"></div>

                    {/* Cert & Dates */}
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Thu hoạch</div>
                        <div className="text-sm font-bold text-slate-800">{selectedShipment.traceability.harvestDate}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Đóng gói</div>
                        <div className="text-sm font-bold text-slate-800">{selectedShipment.traceability.packDate}</div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Chứng nhận</div>
                        <div 
                          className="flex items-center gap-1.5 text-sm font-bold text-blue-600 cursor-pointer hover:underline"
                          onClick={() => setShowCertModal(true)}
                        >
                          <ShieldCheck size={16} />
                          {selectedShipment.traceability.certCode}
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}


            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center mt-auto">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
              </span>
              <div className="flex gap-3">
                {detailTab === 'origin' && (
                  <button 
                    onClick={() => setShowQRModal(true)}
                    className="px-6 py-2.5 bg-sage-600 text-white hover:bg-sage-700 active:scale-95 font-bold rounded-xl shadow-sm transition-all text-sm"
                  >
                    In QR Code
                  </button>
                )}
                {detailTab === 'shipping' && (
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    disabled={selectedShipment.status !== 'Đã giao'}
                    className={`px-6 py-2.5 font-bold rounded-xl shadow-sm transition-all text-sm ${selectedShipment.status !== 'Đã giao'
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                      : 'bg-sage-600 text-white hover:bg-sage-700 active:scale-95'
                      }`}
                  >
                    Xem xác nhận nhận hàng
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Truck className="text-sage-600" /> Tạo đơn vận chuyển mới
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">1. Thông tin lô hàng</h4>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Chọn lô hàng cần vận chuyển <span className="text-red-500">*</span></label>
                  <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all font-medium text-slate-700">
                    <option value="">-- Lựa chọn lô hàng có sẵn trong kho --</option>
                    <option value="1">Lô hàng rau sạch Đà Lạt (BATCH-1029)</option>
                    <option value="2">Lô hàng trái cây Miền Tây (BATCH-1030)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">2. Thông tin điều phối</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Đối tác vận chuyển <span className="text-red-500">*</span></label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all font-medium text-slate-700">
                      <option value="">-- Chọn đơn vị --</option>
                      <option value="1">Giao Hàng Nhanh</option>
                      <option value="2">Vận tải Phương Trang</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tên tài xế phụ trách <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Nhập họ tên tài xế..."
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Biển số xe <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="Ví dụ: 51C-123.45"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Yêu cầu nhiệt độ (Độ C)</label>
                    <input type="number" defaultValue="4" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all font-medium text-slate-700" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">3. Lộ trình giao hàng</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Kho xuất phát <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      defaultValue="Kho trung tâm"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all font-medium text-slate-700"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cửa hàng đích <span className="text-red-500">*</span></label>
                    <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all font-medium text-slate-700">
                      <option value="">-- Chọn cửa hàng --</option>
                      <option value="1">BlueFood Q1</option>
                      <option value="2">BlueFood Q3</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Ghi chú vận chuyển</label>
                <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-sage-500/50 focus:border-sage-500 outline-none transition-all font-medium text-slate-700 resize-none h-24" placeholder="Ghi chú thêm cho tài xế hoặc thủ kho..."></textarea>
              </div>
            </div>

            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3">
              <button onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors shadow-sm bg-white border border-slate-200">
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  alert('Đã tạo đơn vận chuyển thành công!');
                  setShowCreateModal(false);
                }}
                className="px-6 py-2.5 text-sm font-bold text-white bg-sage-600 hover:bg-sage-700 rounded-xl transition-colors shadow-sm"
              >
                Tạo đơn vận chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export QR Code Modal */}
      {showQRModal && selectedShipment && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white">
              <h3 className="text-xl font-bold text-slate-800">Xuất mã QR nguồn gốc</h3>
              <button onClick={() => setShowQRModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center bg-white">
              {/* QR Code Placeholder */}
              <div className="w-64 h-64 border-2 border-slate-200 rounded-2xl flex items-center justify-center bg-white shadow-sm mb-6 relative overflow-hidden group">
                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(window.location.origin + '/trace/' + selectedShipment.id)}`} alt="QR Code" className="w-full h-full object-contain p-4 relative z-10" />


                <div className="absolute inset-0 border-2 border-transparent group-hover:border-sage-400/30 rounded-2xl transition-colors"></div>
              </div>

              {/* Data Links */}
              <div className="w-full">
                <div className="text-sm font-bold text-slate-800 mb-3">Thông tin dữ liệu liên kết:</div>
                <div className="border-2 border-dashed border-slate-400 rounded-xl p-5 bg-white space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-sm font-bold text-slate-800 min-w-[140px]">Mã lô hàng:</span>
                    <span className="text-sm font-medium text-slate-600">{selectedShipment.title}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-sm font-bold text-slate-800 min-w-[140px]">Sản phẩm:</span>
                    <span className="text-sm font-medium text-slate-600">{selectedShipment.traceability.productName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-sm font-bold text-slate-800 min-w-[140px]">Nguồn gốc:</span>
                    <span className="text-sm font-medium text-slate-600">{selectedShipment.traceability.farmName}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-sm font-bold text-slate-800 min-w-[140px]">Thời gian ghi nhận:</span>
                    <span className="text-sm font-medium text-slate-600">{selectedShipment.traceability.packDate}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 flex justify-center gap-4 bg-slate-50">
              <button
                onClick={async () => {
                  try {
                    const url = `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(window.location.origin + '/trace/' + selectedShipment.id)}`;
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const objectUrl = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = objectUrl;
                    link.download = `QR_${selectedShipment.id}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    window.URL.revokeObjectURL(objectUrl);
                  } catch (error) {
                    console.error('Error downloading QR:', error);
                    alert('Lỗi khi tải hình ảnh. Vui lòng thử lại sau.');
                  }
                }}
                className="px-6 py-3 text-sm font-bold text-slate-800 bg-white border-2 border-slate-800 hover:bg-slate-100 transition-all w-1/2 shadow-sm"
              >
                Tải file hình ảnh
              </button>
              <button
                onClick={() => {
                  alert('Đang kết nối với máy in...');
                  setShowQRModal(false);
                }}
                className="px-6 py-3 text-sm font-bold text-white bg-black hover:bg-slate-800 transition-all w-1/2 shadow-md flex items-center justify-center gap-2"
              >
                In trực tiếp ra máy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Shipment Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-red-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white border border-red-100 text-red-500 shadow-sm">
                  <AlertCircle size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Xác nhận Hủy Lô Hàng</h3>
              </div>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Bạn đang thực hiện thao tác <strong className="text-red-600">hủy</strong> lô hàng <strong className="text-slate-800">{selectedShipment?.title}</strong>. Thao tác này không thể hoàn tác.
              </p>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Lý do hủy lô hàng <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl text-sm outline-none resize-none h-28 transition-all ${!cancelReason.trim() ? 'border-red-300 focus:border-red-500 focus:ring-2 focus:ring-red-200' : 'border-slate-200 focus:border-sage-500 focus:ring-2 focus:ring-sage-500/30'}`}
                  placeholder="Bắt buộc nhập lý do hủy để lưu Audit Log..."
                  autoFocus
                />
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button onClick={() => setShowCancelModal(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition-colors shadow-sm">
                Hủy bỏ
              </button>
              <button
                disabled={!cancelReason.trim()}
                onClick={() => {
                  if (!canModifySelectedShipment) {
                    setShowCancelModal(false);
                    setCancelReason('');
                    return;
                  }
                  setShipmentRows(shipmentRows.map((s: any) => s.id === selectedShipment.id ? { ...s, status: 'Đã hủy', tone: 'locked' } : s));
                  setSelectedShipment({ ...selectedShipment, status: 'Đã hủy', tone: 'locked' });
                  setShowCancelModal(false);
                  setCancelReason('');
                  alert('Lô hàng đã được hủy.');
                }}
                className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-sm"
              >
                Xác nhận Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cert Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white border border-blue-100 text-blue-500 shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">Chi tiết Chứng chỉ</h3>
              </div>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-slate-200 shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Loại chứng chỉ</div>
                <div className="text-sm font-semibold text-slate-800">{selectedShipment?.traceability.certCode}</div>
              </div>
              <div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Tổ chức cấp</div>
                <div className="text-sm font-semibold text-slate-800">Bộ Nông Nghiệp & PTNT</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Ngày cấp</div>
                  <div className="text-sm font-semibold text-slate-800">10/01/2026</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Ngày hết hạn</div>
                  <div className="text-sm font-semibold text-slate-800">10/01/2027</div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button className="w-full py-2.5 px-4 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:border-slate-300 rounded-xl text-sm font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors">
                  <FileText size={16} className="text-blue-500" />
                  Tải xuống tệp đính kèm (PDF)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    
      {/* Delivery Confirmation Modal */}
      {showDeliveryModal && selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sage-100 text-sage-600 flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Xác Nhận Nhận Hàng</h3>
                  <p className="text-xs text-slate-500 font-medium">Mã vận đơn: {selectedShipment.id}</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-emerald-50 rounded-xl p-4 flex items-start gap-3 border border-emerald-100">
                <CheckCircle2 className="text-emerald-500 mt-0.5" size={18} />
                <div>
                  <div className="text-sm font-bold text-emerald-800">Đã giao hàng thành công</div>
                  <div className="text-xs text-emerald-600 mt-1">Lô hàng đã được kiểm tra và nhập kho đầy đủ theo tiêu chuẩn.</div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Người xác nhận:</span>
                  <span className="text-sm font-bold text-slate-800">{selectedShipment.transport?.deliveryConfirmer?.fullName || 'Hệ thống / Quản lý kho'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Tên kho nhận:</span>
                  <span className="text-sm font-bold text-slate-800">{selectedShipment.transport?.receiverPartner?.partnerName || 'Kho đích'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-sm text-slate-500 font-medium">Thời gian nhận:</span>
                  <span className="text-sm font-bold text-slate-800">{selectedShipment.transport?.actualArrival ? new Date(selectedShipment.transport.actualArrival).toLocaleString("vi-VN") : 'Chưa cập nhật'}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowDeliveryModal(false)}
                  className="px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
</div>
  );
}
