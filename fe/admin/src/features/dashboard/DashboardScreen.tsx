import { useState } from 'react';
import { ArrowUpRight, Clock, Truck, ShieldAlert, Package, Users, BarChart3, Activity } from 'lucide-react';

export function DashboardScreen({ data: _data }: { data?: any }) {
  const [timeRange, setTimeRange] = useState('Theo tuần');

  const chartDataMap = {
    'Theo tuần': {
      title: 'Lưu lượng vận chuyển (7 ngày gần nhất)',
      yMax: 100,
      data: [
        { day: 'T2', val: 45 }, { day: 'T3', val: 60 }, { day: 'T4', val: 55 },
        { day: 'T5', val: 80 }, { day: 'T6', val: 95 }, { day: 'T7', val: 40 }, { day: 'CN', val: 30 },
      ]
    },
    'Theo tháng': {
      title: 'Lưu lượng vận chuyển (4 tuần gần nhất)',
      yMax: 200,
      data: [
        { day: 'Tuần 1', val: 120 }, { day: 'Tuần 2', val: 150 },
        { day: 'Tuần 3', val: 135 }, { day: 'Tuần 4', val: 180 }
      ]
    },
    'Theo năm': {
      title: 'Lưu lượng vận chuyển (12 tháng qua)',
      yMax: 800,
      data: [
        { day: 'T1', val: 350 }, { day: 'T2', val: 320 }, { day: 'T3', val: 410 },
        { day: 'T4', val: 380 }, { day: 'T5', val: 450 }, { day: 'T6', val: 480 },
        { day: 'T7', val: 520 }, { day: 'T8', val: 490 }, { day: 'T9', val: 560 },
        { day: 'T10', val: 600 }, { day: 'T11', val: 650 }, { day: 'T12', val: 720 },
      ]
    }
  };

  const currentChart = chartDataMap[timeRange as keyof typeof chartDataMap];
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-10">
      <header className="mb-2">
        <h1 className="text-3xl font-bold text-slate-800">Bảng điều khiển</h1>
        <p className="text-slate-500 mt-1">Theo dõi thời gian thực toàn bộ chuỗi cung ứng BlueFood</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-sage-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
              <Truck size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
              <ArrowUpRight size={14} /> 12%
            </span>
          </div>
          <div className="text-sm font-bold text-slate-500 mb-1">Đang vận chuyển</div>
          <div className="text-3xl font-bold text-slate-800">24 <span className="text-sm font-medium text-slate-400">chuyến</span></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-sage-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-lg">
              <Users size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
              Cần xử lý
            </span>
          </div>
          <div className="text-sm font-bold text-slate-500 mb-1">Yêu cầu đối tác</div>
          <div className="text-3xl font-bold text-slate-800">8 <span className="text-sm font-medium text-slate-400">chờ duyệt</span></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between group hover:border-sage-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg">
              <Package size={20} />
            </div>
          </div>
          <div className="text-sm font-bold text-slate-500 mb-1">Cảnh báo tồn kho</div>
          <div className="text-3xl font-bold text-slate-800">15 <span className="text-sm font-medium text-slate-400">sắp hết hạn</span></div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-sm flex flex-col justify-between group hover:border-red-300 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg">
              <ShieldAlert size={20} />
            </div>
            <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg animate-pulse">
              Khẩn cấp
            </span>
          </div>
          <div className="text-sm font-bold text-red-600 mb-1">Sự cố lô hàng</div>
          <div className="text-3xl font-bold text-red-700">3 <span className="text-sm font-medium text-red-400">báo cáo lỗi</span></div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-4">
        {/* Main Chart Area */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart3 className="text-sage-600" size={20} />
              {currentChart.title}
            </h2>
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-600 px-3 py-1.5 outline-none hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <option value="Theo tuần">Theo tuần</option>
              <option value="Theo tháng">Theo tháng</option>
              <option value="Theo năm">Theo năm</option>
            </select>
          </div>
          <div className="flex-1 bg-white rounded-xl border border-slate-100 relative flex p-6 min-h-[300px]">
            {/* Y-axis labels and grid */}
            <div className="absolute left-0 top-6 bottom-14 w-full flex flex-col justify-between px-6 z-0 pointer-events-none">
              {[currentChart.yMax, currentChart.yMax * 0.75, currentChart.yMax * 0.5, currentChart.yMax * 0.25, 0].map(val => (
                <div key={val} className="flex items-center w-full gap-4">
                  <div className="w-8 text-right text-xs font-bold text-slate-400">{val}</div>
                  <div className="flex-1 border-b border-dashed border-slate-200"></div>
                </div>
              ))}
            </div>
            
            {/* Bars container */}
            <div className="flex-1 flex items-end justify-between gap-2 sm:gap-6 pl-16 pr-4 relative z-10 h-full pb-8">
              {currentChart.data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group h-full justify-end relative">
                  <div 
                    className="w-full max-w-[48px] bg-sage-300 hover:bg-sage-400 rounded-t-lg transition-colors relative flex justify-center cursor-pointer shadow-sm" 
                    style={{ height: `${(item.val / currentChart.yMax) * 100}%` }}
                  >
                    <div className="absolute -top-9 bg-slate-800 text-white text-xs px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-md pointer-events-none">
                      {item.val} chuyến
                    </div>
                  </div>
                  <div className="text-xs font-bold text-slate-500 absolute -bottom-6">{item.day}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Stream (Audit Logs) */}
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Activity className="text-sage-600" size={20} />
              Hoạt động gần đây
            </h2>
            <button className="text-xs font-bold text-sage-600 hover:underline">Xem tất cả</button>
          </div>
          <div className="relative flex-1">
            <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
            <div className="space-y-5">
              {[
                { time: '10 phút trước', user: 'Tài xế Nguyễn Văn A', action: 'Cập nhật nhiệt độ', meta: 'Lô hàng #BF-102: 4°C', color: 'bg-blue-500' },
                { time: '1 giờ trước', user: 'Quản lý Kho Q1', action: 'Xác nhận nhận hàng', meta: 'Lô hàng #BF-098 thành công', color: 'bg-emerald-500' },
                { time: '3 giờ trước', user: 'Hệ thống', action: 'Cảnh báo nhiệt độ', meta: 'Lô hàng #BF-105 vượt mức 8°C', color: 'bg-red-500' },
                { time: 'Hôm qua', user: 'Admin', action: 'Phê duyệt đối tác', meta: 'Nông trại Đà Lạt Fresh', color: 'bg-sage-500' },
                { time: 'Hôm qua', user: 'Hệ thống', action: 'Xuất báo cáo', meta: 'Báo cáo tồn kho tuần 4', color: 'bg-slate-400' },
              ].map((log, i) => (
                <div key={i} className="relative pl-8">
                  <div className={`absolute left-0 top-1 w-[24px] h-[24px] rounded-full border-4 border-white ${log.color} shadow-sm z-10`}></div>
                  <div className="text-sm font-bold text-slate-800">{log.action}</div>
                  <div className="text-sm text-slate-600 mt-0.5">{log.meta}</div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <Clock size={12} /> {log.time} • {log.user}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Second Row of Widgets */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-2">
        {/* Quality Certificates */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldAlert className="text-sage-600" size={20} />
              Chứng nhận chất lượng
            </h2>
            <button className="text-xs font-bold text-sage-600 hover:underline">Quản lý (UC14)</button>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-emerald-600 font-bold">VG</div>
                <div>
                  <div className="font-bold text-slate-800">VietGAP 2026</div>
                  <div className="text-xs text-slate-500">Nông trại Đà Lạt Fresh</div>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Hợp lệ</span>
            </div>
            <div className="p-4 rounded-xl border border-amber-100 bg-amber-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-amber-600 font-bold">GG</div>
                <div>
                  <div className="font-bold text-slate-800">GlobalGAP</div>
                  <div className="text-xs text-slate-500">Hợp tác xã Miền Tây</div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded block mb-1">Sắp hết hạn</span>
                <span className="text-[10px] text-amber-700">Còn 15 ngày</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Partners */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="text-sage-600" size={20} />
              Đối tác tiêu biểu
            </h2>
            <select className="text-sm border-slate-200 rounded-lg bg-slate-50 font-medium text-slate-600 px-3 py-1.5 outline-none">
              <option>Tháng này</option>
              <option>Năm nay</option>
            </select>
          </div>
          <div className="space-y-4">
            {[
              { name: 'Giao Hàng Nhanh', role: 'Vận chuyển', volume: '142 chuyến', status: 'Xuất sắc' },
              { name: 'Nông trại Đà Lạt Fresh', role: 'Nhà cung cấp', volume: '85 lô hàng', status: 'Tốt' },
              { name: 'BlueFood Q1', role: 'Cửa hàng', volume: '64 lần nhập', status: 'Tốt' }
            ].map((partner, i) => (
              <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs">{i+1}</div>
                  <div>
                    <div className="font-bold text-slate-800 text-sm">{partner.name}</div>
                    <div className="text-xs text-slate-500">{partner.role}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-sage-600 text-sm">{partner.volume}</div>
                  <div className="text-xs text-slate-400">{partner.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
