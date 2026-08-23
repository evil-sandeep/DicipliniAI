import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a branded PDF statement of the user's monthly expenses.
 * @param {Object} params
 * @param {number} params.monthlyBudget
 * @param {Array} params.expenses
 * @param {Object} params.user
 */
export async function downloadExpensePDF({ monthlyBudget = 0, expenses = [], user = null, monthLabel = null }) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const totalSpent = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const remainingBalance = monthlyBudget - totalSpent;
  const spentPct = monthlyBudget > 0 ? Math.min(100, Math.round((totalSpent / monthlyBudget) * 100)) : 0;

  const currentMonthYear = monthLabel || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const generatedOn = new Date().toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // ── Top Header Banner Background ──────────────────────────────
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, 'F');

  // ── Try Loading & Drawing Logo ───────────────────────────────
  try {
    const logoImg = new Image();
    logoImg.src = '/logo.png';
    await new Promise((resolve) => {
      logoImg.onload = () => {
        try {
          doc.addImage(logoImg, 'PNG', margin, 6, 28, 28);
        } catch (err) {
          console.warn('Could not render logo to PDF:', err);
        }
        resolve();
      };
      logoImg.onerror = () => resolve();
      setTimeout(resolve, 500);
    });
  } catch (e) {
    // Continue without logo if not loadable
  }

  // ── Header Title & Details ──────────────────────────────────
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('DiscipliniOS', 46, 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Monthly Expense & Financial Discipline Statement', 46, 22);

  // Right-aligned report metadata
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  doc.text(`Statement Period: ${currentMonthYear}`, pageWidth - margin, 14, { align: 'right' });
  doc.text(`User: ${user?.name || user?.email?.split('@')[0] || 'Valued User'}`, pageWidth - margin, 20, { align: 'right' });
  doc.text(`Generated: ${generatedOn}`, pageWidth - margin, 26, { align: 'right' });

  // ── Financial Summary Metrics Cards ─────────────────────────
  const startY = 48;
  const cardWidth = (pageWidth - margin * 2 - 8) / 3;
  const cardHeight = 22;

  // 1. Total Budget Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, startY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('MONTHLY BUDGET', margin + 4, startY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(`Rs. ${Number(monthlyBudget).toLocaleString('en-IN')}`, margin + 4, startY + 16);

  // 2. Total Spent Card
  const card2X = margin + cardWidth + 4;
  doc.setFillColor(254, 242, 242);
  doc.setDrawColor(254, 202, 202);
  doc.roundedRect(card2X, startY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(185, 28, 28);
  doc.text('TOTAL SPENT', card2X + 4, startY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38);
  doc.text(`Rs. ${Number(totalSpent).toLocaleString('en-IN')}`, card2X + 4, startY + 16);

  // 3. Remaining Balance Card
  const card3X = card2X + cardWidth + 4;
  const isHealthy = remainingBalance >= monthlyBudget * 0.2;
  doc.setFillColor(isHealthy ? 240 : 254, isHealthy ? 253 : 242, isHealthy ? 244 : 242);
  doc.setDrawColor(isHealthy ? 187 : 254, isHealthy ? 247 : 202, isHealthy ? 208 : 202);
  doc.roundedRect(card3X, startY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(isHealthy ? 21 : 185, isHealthy ? 128 : 28, isHealthy ? 61 : 28);
  doc.text('REMAINING BALANCE', card3X + 4, startY + 6);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(isHealthy ? 22 : 220, isHealthy ? 101 : 38, isHealthy ? 52 : 38);
  doc.text(`Rs. ${Number(remainingBalance).toLocaleString('en-IN')}`, card3X + 4, startY + 16);

  // ── Progress & Utilization Note ─────────────────────────────
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Budget Utilization: ${spentPct}% of monthly budget utilized. (${expenses.length} transaction${expenses.length === 1 ? '' : 's'} recorded)`, margin, startY + 29);

  // ── Sorted Itemized Expense Table ───────────────────────────
  const sortedExpenses = [...expenses].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt);
    const dateB = new Date(b.date || b.createdAt);
    return dateB - dateA;
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tableRows = sortedExpenses.map((exp, index) => {
    const expDate = new Date(exp.date || exp.createdAt);
    expDate.setHours(0, 0, 0, 0);
    const isBackDate = expDate < today;

    const formattedDate = new Date(exp.date || Date.now()).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return [
      index + 1,
      `${formattedDate}${isBackDate ? ' (Back Date)' : ''}`,
      exp.title,
      exp.category || 'Others',
      `Rs. ${Number(exp.amount).toLocaleString('en-IN')}`
    ];
  });

  autoTable(doc, {
    startY: startY + 34,
    head: [['#', 'Date', 'Expense Title', 'Category', 'Amount']],
    body: tableRows.length > 0 ? tableRows : [['-', '-', 'No expenses recorded for this month', '-', 'Rs. 0']],
    foot: [
      ['', '', 'TOTAL AMOUNT SPENT', `${expenses.length} Entries`, `Rs. ${Number(totalSpent).toLocaleString('en-IN')}`]
    ],
    theme: 'striped',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo-600
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    footStyles: {
      fillColor: [241, 245, 249],
      textColor: [15, 23, 42],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85]
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 32 },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] }
    },
    margin: { left: margin, right: margin }
  });

  // ── Category Breakdown Summary Table ─────────────────────────
  const finalY = doc.lastAutoTable?.finalY || (startY + 40);

  if (finalY < pageHeight - 50 && expenses.length > 0) {
    const categorySpending = {};
    expenses.forEach(e => {
      const cat = e.category || 'Others';
      categorySpending[cat] = (categorySpending[cat] || 0) + Number(e.amount || 0);
    });

    const categoryRows = Object.entries(categorySpending).map(([cat, amt]) => [
      cat,
      `Rs. ${Number(amt).toLocaleString('en-IN')}`,
      totalSpent > 0 ? `${Math.round((amt / totalSpent) * 100)}%` : '0%'
    ]);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text('CATEGORY BREAKDOWN', margin, finalY + 10);

    autoTable(doc, {
      startY: finalY + 13,
      head: [['Category', 'Amount Spent', 'Share of Total']],
      body: categoryRows,
      theme: 'plain',
      headStyles: {
        fillColor: [226, 232, 240],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 8
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [71, 85, 105]
      },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 30 }
      },
      margin: { left: margin }
    });
  }

  // ── Footer Copyright & Creator Watermark ─────────────────────
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Decorative bottom border line
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      '© 2026 DiscipliniOS. All rights reserved. | Founder: Mr. Sandeep (https://sandeep-lilac.vercel.app/)',
      margin,
      pageHeight - 7
    );

    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - margin,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  // ── Save & Download PDF ──────────────────────────────────────
  const filename = `DiscipliniOS_Expense_Statement_${currentMonthYear.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
