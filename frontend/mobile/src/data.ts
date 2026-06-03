export type BatchStatus = 'ready' | 'at_warehouse' | 'in_transit' | 'delivered' | 'incident_reported' | 'cancelled';

export type CertificateStatus = 'valid' | 'expiring' | 'expired';

export type Certificate = {
  id: string;
  name: string;
  issuer: string;
  issuedDate: string;
  expiryDate: string;
  status: CertificateStatus;
  note: string;
};

export type SupplyChainCheckpoint = {
  id: string;
  sequence: number;
  locationName: string;
  statusAtCheckpoint: string;
  note: string;
  reportedAt: string;
  updated: boolean;
};

export type SupplyChainTransport = {
  id: string;
  status: string;
  actualDeparture: string;
  actualArrival: string;
  destinationName: string;
  checkpoints: SupplyChainCheckpoint[];
};

export type Batch = {
  id: string;
  batchCode: string;
  productName: string;
  productType: string;
  quantity: number;
  harvestDate: string;
  expiryDate: string;
  status: BatchStatus;
  location: string;
  certifications: Certificate[];
  hasQR: boolean;
  qrCodePath?: string;
  notes: string;
  transport?: SupplyChainTransport;
};

export const batches: Batch[] = [
  {
    id: 'b001',
    batchCode: 'BF-2024-0891',
    productName: 'Cà chua hữu cơ',
    productType: 'Rau củ quả',
    quantity: 250,
    harvestDate: '15/04/2024',
    expiryDate: '30/04/2024',
    status: 'delivered',
    location: 'Đà Lạt, Lâm Đồng',
    certifications: [
      { id: 'c001', name: 'VietGAP', issuer: 'Trung tâm Chất lượng Nông Lâm Thủy sản', issuedDate: '01/01/2024', expiryDate: '31/12/2026', status: 'valid', note: 'Chứng nhận quy trình sản xuất rau quả an toàn.' },
      { id: 'c002', name: 'HACCP', issuer: 'Bureau Veritas Việt Nam', issuedDate: '15/02/2024', expiryDate: '15/02/2027', status: 'valid', note: 'Áp dụng cho sơ chế và đóng gói sau thu hoạch.' }
    ],
    hasQR: true,
    notes: 'Cà chua cherry hữu cơ, trồng trong nhà kính'
  },
  {
    id: 'b002',
    batchCode: 'BF-2024-0892',
    productName: 'Rau cải xanh',
    productType: 'Rau lá',
    quantity: 180,
    harvestDate: '18/04/2024',
    expiryDate: '25/04/2024',
    status: 'in_transit',
    location: 'Mộc Châu, Sơn La',
    certifications: [
      { id: 'c003', name: 'VietGAP', issuer: 'Sở NN&PTNT Sơn La', issuedDate: '10/03/2024', expiryDate: '10/03/2026', status: 'expiring', note: 'Cần gia hạn trước mùa vụ tiếp theo.' }
    ],
    hasQR: true,
    notes: 'Rau cải baby, thu hoạch sáng sớm'
  },
  {
    id: 'b003',
    batchCode: 'BF-2024-0893',
    productName: 'Dưa leo sạch',
    productType: 'Rau củ quả',
    quantity: 320,
    harvestDate: '20/04/2024',
    expiryDate: '27/04/2024',
    status: 'ready',
    location: 'Đức Trọng, Lâm Đồng',
    certifications: [
      { id: 'c004', name: 'GlobalGAP', issuer: 'Control Union', issuedDate: '22/01/2024', expiryDate: '22/01/2027', status: 'valid', note: 'Mã vùng trồng đã được đối soát.' },
      { id: 'c005', name: 'VietGAP', issuer: 'Chi cục Trồng trọt Lâm Đồng', issuedDate: '05/01/2024', expiryDate: '05/01/2026', status: 'expiring', note: 'Đang chờ lịch đánh giá định kỳ.' }
    ],
    hasQR: false,
    notes: 'Dưa leo Nhật, trồng theo tiêu chuẩn GlobalGAP'
  },
  {
    id: 'b004',
    batchCode: 'BF-2024-0894',
    productName: 'Ớt Đà Lạt',
    productType: 'Rau củ quả',
    quantity: 90,
    harvestDate: '12/04/2024',
    expiryDate: '26/04/2024',
    status: 'in_transit',
    location: 'Đà Lạt, Lâm Đồng',
    certifications: [
      { id: 'c006', name: 'VietGAP', issuer: 'Chi cục Trồng trọt Lâm Đồng', issuedDate: '12/01/2023', expiryDate: '12/01/2025', status: 'expired', note: 'Cần cập nhật chứng nhận mới trước khi xuất kho.' }
    ],
    hasQR: true,
    notes: 'Ớt chuông ba màu, xuất khẩu chất lượng cao'
  }
];
