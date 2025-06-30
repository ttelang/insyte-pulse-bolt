import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { Download, X } from 'lucide-react';
import { FormService } from '../services/formService';

interface QRCodeGeneratorProps {
  formId: string;
  formTitle: string;
  onClose: () => void;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({ formId, formTitle, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const formUrl = `${window.location.origin}/form/${formId}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, formUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#1F2937',
          light: '#FFFFFF'
        }
      });
    }
  }, [formUrl]);

  const downloadQRCode = async () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `${formTitle.replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
      
      // Record invitation when QR code is downloaded
      await FormService.recordInvitation(formId, 'qr_code', 'downloaded');
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(formUrl);
      
      // Record invitation when link is copied from QR modal
      await FormService.recordInvitation(formId, 'qr_code', 'copied_link');
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">QR Code Generator</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 text-center">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">{formTitle}</h4>
            <p className="text-sm text-gray-600">Scan to access feedback form</p>
          </div>
          
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <canvas ref={canvasRef} />
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded font-mono break-all">
              {formUrl}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={downloadQRCode}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button
                onClick={copyLink}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QRCodeGenerator;