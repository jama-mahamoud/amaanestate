import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import { Agreement } from '@/services/agreementService';

export const generateQRCode = async (id: string): Promise<string> => {
  try {
    const url = `${window.location.origin}/verify/${id}`;
    return await QRCode.toDataURL(url);
  } catch (err) {
    console.error("QR creation error:", err);
    throw err;
  }
};

export const generateAgreementPDF = (agreement: Agreement): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Helper functions for design
  const drawBorder = () => {
    // Elegant frame border
    doc.setDrawColor(197, 160, 89); // Gold Border
    doc.setLineWidth(0.5);
    doc.rect(margin - 3, margin - 3, contentWidth + 6, pageHeight - (margin * 2) + 6);
    
    doc.setDrawColor(20, 20, 20); // Inner thin frame
    doc.setLineWidth(0.1);
    doc.rect(margin - 1, margin - 1, contentWidth + 2, pageHeight - (margin * 2) + 2);
  };

  const drawHeader = () => {
    // Logo text branding
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(30, 30, 30);
    doc.text('AMAANESTATE', margin + 5, margin + 12);

    // Subheader
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(120, 120, 120);
    doc.text('SECURE LEASE & EXCHANGE NETWORK', margin + 5, margin + 17);

    // Document Name and ID Block right-aligned
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(197, 160, 89);
    doc.text('OFFICIAL AGREEMENT DEED', pageWidth - margin - 5, margin + 10, { align: 'right' });
    
    doc.setFont('Helvetica', 'mono');
    doc.setFontSize(7);
    doc.setTextColor(80, 80, 80);
    doc.text(`DEED REQ ID: ${agreement.agreementId}`, pageWidth - margin - 5, margin + 15, { align: 'right' });
    const statusText = agreement.status === 'revision_requested' ? 'REVISION REQUIRED' : agreement.status.toUpperCase();
    doc.text(`STATUS: ${statusText}`, pageWidth - margin - 5, margin + 19, { align: 'right' });
    
    if (agreement.certificateNumber) {
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 58, 138); // Blue
      doc.text(`CERTIFICATE: ${agreement.certificateNumber}`, pageWidth - margin - 5, margin + 23, { align: 'right' });
    }

    // Horizontal golden separating rule
    doc.setDrawColor(197, 160, 89);
    doc.setLineWidth(0.8);
    doc.line(margin, margin + 26, pageWidth - margin, margin + 26);
  };

  const drawFooter = (pageNum: number) => {
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - margin - 8, pageWidth - margin, pageHeight - margin - 8);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 140, 140);
    doc.text('AmaanEstate Digital Registry Verification System. Ethically and legally protected.', margin + 5, pageHeight - margin - 4);
    doc.text(`Page ${pageNum}`, pageWidth - margin - 5, pageHeight - margin - 4, { align: 'right' });
  };

  // Build Pages
  let y = margin + 32;

  drawBorder();
  drawHeader();

  // Document Title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(30, 30, 30);
  doc.text(agreement.agreementTitle.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  
  y += 6;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date of Covenant: ${agreement.date}`, pageWidth / 2, y, { align: 'center' });

  y += 10;

  // Render Table / Card sections helper
  const renderSectionHeader = (title: string) => {
    doc.setFillColor(242, 239, 233);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(130, 100, 40);
    doc.text(title, margin + 3, y + 4.5);
    y += 10;
  };

  // SECTION A: COVENANT TERMS
  renderSectionHeader('I. CONTRACT SPECIFICATIONS');
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Agreement Type:', margin + 5, y);
  doc.setFont('Helvetica', 'normal');
  doc.text(agreement.agreementType.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()), margin + 45, y);
  
  y += 5;
  doc.setFont('Helvetica', 'bold');
  doc.text('Deed Date:', margin + 5, y);
  doc.setFont('Helvetica', 'normal');
  doc.text(agreement.date, margin + 45, y);

  y += 5;
  doc.setFont('Helvetica', 'bold');
  doc.text('Valuation Rate:', margin + 5, y);
  doc.setFont('Helvetica', 'normal');
  
  let priceStr = 'N/A';
  if (agreement.agreementType === 'brokerCommission') {
    priceStr = agreement.assetInfo.commissionTerms || 'Commission Basis';
  } else {
    // Deduce price from properties/vehicles assetInfo if present
    const priceVal = agreement.assetInfo.property?.price || agreement.assetInfo.vehicle?.price || 0;
    priceStr = `${priceVal.toLocaleString()} ${agreement.currency}`;
  }
  doc.text(priceStr, margin + 45, y);

  y += 10;

  // SECTION B: PARTIES
  renderSectionHeader('II. CONTRACTING PARTIES');
  
  // Party A & B Side by Side
  const colWidth = contentWidth / 2 - 4;
  
  // Party A Box
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  doc.text('PARTY A (Covenantee / Owner):', margin + 5, y);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Full Name: ${agreement.parties.partyA.fullName}`, margin + 5, y + 5);
  doc.text(`Contact: ${agreement.parties.partyA.phone}`, margin + 5, y + 10);
  doc.text(`Email: ${agreement.parties.partyA.email}`, margin + 5, y + 15);
  doc.text(`ID Number: ${agreement.parties.partyA.nationalId}`, margin + 5, y + 20);
  doc.text(`Address: ${agreement.parties.partyA.address}`, margin + 5, y + 25);

  // Party B Box
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(40, 40, 40);
  doc.text('PARTY B (Coveynator / Client):', margin + colWidth + 10, y);
  
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);
  doc.text(`Full Name: ${agreement.parties.partyB.fullName}`, margin + colWidth + 10, y + 5);
  doc.text(`Contact: ${agreement.parties.partyB.phone}`, margin + colWidth + 10, y + 10);
  doc.text(`Email: ${agreement.parties.partyB.email}`, margin + colWidth + 10, y + 15);
  doc.text(`ID Number: ${agreement.parties.partyB.nationalId}`, margin + colWidth + 10, y + 20);
  doc.text(`Address: ${agreement.parties.partyB.address}`, margin + colWidth + 10, y + 25);

  y += 34;

  // SECTION C: ASSET SUBJECT
  renderSectionHeader('III. SUBJECT OF ASSIGNED ASSET');

  doc.setFontSize(8.5);
  doc.setTextColor(80, 80, 80);

  if (agreement.agreementType.startsWith('property')) {
    const prop = agreement.assetInfo.property;
    if (prop) {
      doc.text(`Property Identifier: ${prop.propertyId || 'GRID-N/A'}`, margin + 5, y);
      doc.text(`Property Name/Title: ${prop.propertyTitle}`, margin + 5, y + 5);
      doc.text(`Terrace Category: ${prop.category} | Class: ${prop.type}`, margin + 5, y + 10);
      doc.text(`Geographic Location: ${prop.district}, ${prop.city}`, margin + 5, y + 15);
      doc.text(`Agreed Terms: ${prop.paymentTerms || 'Bilateral Terms Agreed'}`, margin + 5, y + 20);
    } else {
      doc.text('No property information mapped to document metadata.', margin + 5, y);
    }
    y += 28;
  } else if (agreement.agreementType.startsWith('vehicle')) {
    const veh = agreement.assetInfo.vehicle;
    if (veh) {
      doc.text(`Vehicle Serial ID: ${veh.vehicleId || 'SERIAL-N/A'}`, margin + 5, y);
      doc.text(`Automobile Make: ${veh.make} | Model: ${veh.model}`, margin + 5, y + 5);
      doc.text(`Fabrication Year: ${veh.year}`, margin + 5, y + 10);
      doc.text(`License Reg Plate: ${veh.plateNumber}`, margin + 5, y + 15);
    } else {
      doc.text('No vehicle information mapped to document metadata.', margin + 5, y);
    }
    y += 24;
  } else {
    // Broker Commission Terms
    const comm = agreement.assetInfo.commissionTerms || 'Commission terms entered in Section E legal terms.';
    const lines = doc.splitTextToSize(`Service description:\n${comm}`, contentWidth - 10);
    doc.text(lines, margin + 5, y);
    y += Math.max(lines.length * 4.5, 20);
  }

  // Draw footer of page 1
  drawFooter(1);

  // PAGE 2: LEGAL COVENANTS & SIGNATURES
  doc.addPage();
  drawBorder();
  drawHeader();

  y = margin + 30;

  renderSectionHeader('IV. INCORPORATED COVENANTS & GENERAL AGREEMENTS');
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  const legalLines = doc.splitTextToSize(agreement.legalClauses, contentWidth - 10);
  doc.text(legalLines, margin + 5, y);
  
  y += Math.max(legalLines.length * 4.2 + 10, 45);

  // Render QR Code inside PDF if provided
  if (agreement.qrCode) {
    try {
      doc.addImage(agreement.qrCode, 'PNG', margin + 5, y, 26, 26);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8.5);
      
      if (agreement.status === 'Approved') {
        doc.setTextColor(22, 101, 52); // Green
        doc.text('SECURITY REGISTRY CERTIFIED', margin + 35, y + 5);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(110, 110, 110);
        doc.text(`Approved system-side: ${agreement.approvedBy || 'Admin Official'}`, margin + 35, y + 10);
        doc.text(`Witnessed Timestamp: ${agreement.approvedAt ? new Date(agreement.approvedAt).toLocaleString() : new Date().toLocaleString()}`, margin + 35, y + 14);
        doc.text('Scanning the visual QR guarantees cryptographic token verification on the AmaanEstate ledger.', margin + 35, y + 18);
      } else {
        doc.setTextColor(197, 160, 89); // Gold
        doc.text('PROVISIONAL REGISTRY DEED - PENDING APPROVAL', margin + 35, y + 5);
        
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(110, 110, 110);
        doc.text(`Covenant Registered Time: ${agreement.submittedAt ? new Date(agreement.submittedAt).toLocaleString() : new Date().toLocaleString()}`, margin + 35, y + 11);
        doc.text('Scanning the visual QR guarantees instant verification details. Final certification pending officer review.', margin + 35, y + 16);
      }
    } catch (err) {
      console.error("Failed to inject QR Code into PDF:", err);
    }
    y += 32;
  } else {
    // Unapproved or Pending status metadata placeholder without QR code
    doc.setDrawColor(220, 100, 100);
    doc.setFillColor(254, 242, 242);
    doc.rect(margin + 5, y, contentWidth - 10, 16, 'F');
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(220, 50, 50);
    doc.text('STATUS WARNING: PROVISIONAL DRAFT ONLY', margin + 10, y + 6);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('This document does not constitute a legally verified deed on the AmaanEstate registry. Pending endorsement.', margin + 10, y + 11);
    
    y += 24;
  }

  // SIGNATURES AREA
  renderSectionHeader('V. ASSURANCE OF INTENT & BINDING AFFIRMATION');
  
  const sigColWidth = contentWidth / 2 - 4;

  const drawSignaturePlaceholder = (party: string, name: string, xPos: number, pY: number, sigPic?: string) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(xPos, pY + 20, xPos + sigColWidth - 10, pY + 20);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`${party} INDIVIDUAL ASSURANCE`, xPos, pY);

    if (sigPic) {
      try {
        // Render either drawn/uploaded image signature
        doc.addImage(sigPic, 'PNG', xPos + 10, pY + 2, 40, 16);
      } catch (e) {
        // Fallback cursive script
        doc.setFont('Courier', 'oblique');
        doc.setFontSize(14);
        doc.setTextColor(30, 40, 150);
        doc.text(name, xPos + 10, pY + 14);
      }
    } else {
      // Fallback cursive typed signature representation
      doc.setFont('Courier', 'oblique');
      doc.setFontSize(14);
      doc.setTextColor(30, 40, 150);
      doc.text(name, xPos + 10, pY + 14);
    }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Signee Name: ${name}`, xPos, pY + 24);
  };

  drawSignaturePlaceholder('PARTY A', agreement.parties.partyA.fullName, margin + 5, y, agreement.parties.partyA.signatureUrl);
  drawSignaturePlaceholder('PARTY B', agreement.parties.partyB.fullName, margin + sigColWidth + 10, y, agreement.parties.partyB.signatureUrl);

  drawFooter(2);

  // PAGE 3: WITNESS VERIFICATION
  doc.addPage();
  drawBorder();
  drawHeader();

  y = margin + 30;

  renderSectionHeader('VI. WITNESS VERIFICATION');

  const drawWitnessPlaceholder = (title: string, name: string, xPos: number, pY: number, sigPic?: string) => {
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(xPos, pY + 20, xPos + sigColWidth - 10, pY + 20);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`${title.toUpperCase()}`, xPos, pY);

    if (sigPic) {
      try {
        doc.addImage(sigPic, 'PNG', xPos + 10, pY + 2, 40, 16);
      } catch (e) {
        doc.setFont('Courier', 'oblique');
        doc.setFontSize(14);
        doc.setTextColor(30, 40, 150);
        doc.text(name || 'No Signature', xPos + 10, pY + 14);
      }
    } else {
      doc.setFont('Courier', 'oblique');
      doc.setFontSize(14);
      doc.setTextColor(30, 40, 150);
      doc.text(name || 'No Signature', xPos + 10, pY + 14);
    }

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 100, 100);
    doc.text(`Witness Name: ${name || 'N/A'}`, xPos, pY + 24);
  };

  // Render 3 witnesses using columns and spacing
  drawWitnessPlaceholder('WITNESS 1', agreement.witness1FullName || 'N/A', margin + 5, y, agreement.witness1Signature);
  drawWitnessPlaceholder('WITNESS 2', agreement.witness2FullName || 'N/A', margin + sigColWidth + 10, y, agreement.witness2Signature);

  y += 38;
  drawWitnessPlaceholder('WITNESS 3', agreement.witness3FullName || 'N/A', margin + 5, y, agreement.witness3Signature);

  drawFooter(3);

  // Apply Admin Stamp overlay if approved
  if (agreement.status === 'Approved' && agreement.adminStampUrl) {
    try {
      // Add a clean blue verification stamp overlay on signatures page (page 2)
      doc.setPage(2);
      
      // Positioned near signatures
      const stampX = pageWidth - margin - 45;
      const stampY = pageHeight - margin - 60;
      
      doc.addImage(agreement.adminStampUrl, 'PNG', stampX, stampY, 40, 40, undefined, 'FAST');
      
      // Stamp text overlay for authenticity
      doc.setFontSize(6);
      doc.setTextColor(30, 58, 138); // Deep Blue
      doc.setFont('Helvetica', 'bold');
      doc.text(`CERTIFIED BY AMAANESTATE ADMIN`, stampX + 20, stampY + 15, { align: 'center' });
      doc.text(`DATE: ${agreement.approvedAt ? new Date(agreement.approvedAt).toLocaleDateString() : 'N/A'}`, stampX + 20, stampY + 18, { align: 'center' });
      doc.text(`REF: ${agreement.certificateNumber || 'N/A'}`, stampX + 20, stampY + 21, { align: 'center' });
    } catch (stampErr) {
      console.error("PDF Stamp overlay failed:", stampErr);
    }
  }

  return doc;
};
