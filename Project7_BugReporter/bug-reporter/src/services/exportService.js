/**
 * exportService.js
 * Handles PDF and Excel export of bug tickets
 */

import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

/**
 * Export bug ticket as PDF
 */
export async function exportToPDF(ticket, screenshotPreview) {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let y = 20;
    
    // Header with purple background
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, pageWidth, 18, 'F');
    
    // Title - using simple text without emojis/special chars for compatibility
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BUG REPORT', margin, 12);
    
    y = 30;
    doc.setTextColor(0, 0, 0);
    
    // Summary
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    const summaryLines = doc.splitTextToSize(ticket.summary || 'Bug Report', contentWidth);
    doc.text(summaryLines, margin, y);
    y += (summaryLines.length * 6) + 5;
    
    // Metadata Table
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const metadata = [
        ['Project:', ticket.project || 'N/A'],
        ['Issue Type:', ticket.issueType || 'Bug'],
        ['Module:', ticket.module || 'N/A'],
        ['Feature:', ticket.feature || 'N/A'],
        ['Severity:', ticket.severity || 'N/A'],
        ['Priority:', ticket.priority || 'N/A'],
    ];
    
    metadata.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 35, y);
        y += 5.5;
    });
    
    y += 4;
    
    // Description Section
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text('Description', margin + 2, y + 1);
    y += 10;
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const descLines = doc.splitTextToSize(ticket.description || 'N/A', contentWidth);
    doc.text(descLines, margin, y);
    y += (descLines.length * 5) + 8;
    
    // Steps to Reproduce Section
    if (ticket.stepsToReproduce && ticket.stepsToReproduce.length > 0) {
        if (y > 250) { doc.addPage(); y = 20; }
        
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 4, contentWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text('Steps to Reproduce', margin + 2, y + 1);
        y += 10;
        
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        
        ticket.stepsToReproduce.forEach((step, index) => {
            if (y > 270) { doc.addPage(); y = 20; }
            const stepNum = `${index + 1}.`;
            doc.setFont('helvetica', 'bold');
            doc.text(stepNum, margin, y);
            doc.setFont('helvetica', 'normal');
            const stepLines = doc.splitTextToSize(step, contentWidth - 10);
            doc.text(stepLines, margin + 8, y);
            y += (stepLines.length * 5) + 3;
        });
        y += 5;
    }
    
    // Results Section - Side by side or stacked
    if (y > 220) { doc.addPage(); y = 20; }
    
    // Actual Result
    doc.setFillColor(254, 226, 226); // Light red background
    doc.rect(margin, y - 4, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(185, 28, 28);
    doc.text('Actual Result', margin + 2, y + 1);
    y += 10;
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const actualLines = doc.splitTextToSize(ticket.actualResult || 'N/A', contentWidth);
    doc.text(actualLines, margin, y);
    y += (actualLines.length * 5) + 8;
    
    // Expected Result
    if (y > 250) { doc.addPage(); y = 20; }
    
    doc.setFillColor(220, 252, 231); // Light green background
    doc.rect(margin, y - 4, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(22, 101, 52);
    doc.text('Expected Result', margin + 2, y + 1);
    y += 10;
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const expectedLines = doc.splitTextToSize(ticket.expectedResult || 'N/A', contentWidth);
    doc.text(expectedLines, margin, y);
    y += (expectedLines.length * 5) + 8;
    
    // Environment Section
    if (y > 250) { doc.addPage(); y = 20; }
    
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y - 4, contentWidth, 8, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    doc.text('Environment', margin + 2, y + 1);
    y += 10;
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const env = ticket.environment || {};
    const envData = [
        ['App URL:', env.appUrl || 'N/A'],
        ['Browser:', env.browser || 'N/A'],
        ['OS:', env.os || 'N/A'],
        ['Build Version:', env.buildVersion || 'N/A'],
    ];
    
    envData.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, margin + 5, y);
        doc.setFont('helvetica', 'normal');
        doc.text(value, margin + 40, y);
        y += 5.5;
    });
    
    // Screenshot on new page if available
    if (screenshotPreview) {
        doc.addPage();
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, 16, contentWidth, 8, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(60, 60, 60);
        doc.text('Screenshot', margin + 2, 21);
        
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = screenshotPreview;
            });
            
            const imgWidth = contentWidth;
            const imgHeight = (img.height * imgWidth) / img.width;
            const maxHeight = 230;
            const finalHeight = imgHeight > maxHeight ? maxHeight : imgHeight;
            
            doc.addImage(img, 'PNG', margin, 30, imgWidth, finalHeight);
        } catch (e) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.text('Screenshot not available', margin, 35);
        }
    }
    
    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.setFont('helvetica', 'normal');
        doc.text(`Bug Report - Generated by AI Bug Reporter - Page ${i} of ${pageCount}`, margin, 287);
    }
    
    // Download
    const fileName = `BUG_${(ticket.summary || 'ticket').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.pdf`;
    doc.save(fileName);
}

/**
 * Export bug ticket as Excel with proper test case format
 */
export function exportToExcel(ticket, screenshotPreview) {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Generate Test ID
    const testId = `TC_${(ticket.module || 'MOD').toUpperCase().slice(0, 4)}_${Date.now().toString().slice(-4)}`;
    
    // Sheet 1: Test Case Summary (Main bug report)
    const mainData = [
        ['BUG REPORT', ''],
        ['', ''],
        ['Field', 'Value'],
        ['Test ID', testId],
        ['Project', ticket.project || 'N/A'],
        ['Issue Type', ticket.issueType || 'Bug'],
        ['Summary', ticket.summary || 'N/A'],
        ['Module', ticket.module || 'N/A'],
        ['Feature', ticket.feature || 'N/A'],
        ['Severity', ticket.severity || 'N/A'],
        ['Priority', ticket.priority || 'N/A'],
        ['', ''],
        ['Description', ticket.description || 'N/A'],
    ];
    
    const wsMain = XLSX.utils.aoa_to_sheet(mainData);
    wsMain['!cols'] = [{ wch: 20 }, { wch: 80 }];
    XLSX.utils.book_append_sheet(wb, wsMain, 'Bug Summary');
    
    // Sheet 2: Test Case Details (Proper table format)
    const stepsText = ticket.stepsToReproduce 
        ? ticket.stepsToReproduce.map((s, i) => `${i + 1}. ${s}`).join('\n')
        : 'N/A';
    
    const testCaseData = [
        ['TEST CASE DETAILS'],
        [''],
        ['Test ID', testId],
        ['Test Scenario', ticket.feature || ticket.module || 'Functional Testing'],
        ['Summary', ticket.summary || 'N/A'],
        ['Steps to Reproduce', stepsText],
        ['Expected Result', ticket.expectedResult || 'N/A'],
        ['Actual Result', ticket.actualResult || 'N/A'],
        ['Status', 'FAILED'],
        ['Severity', ticket.severity || 'N/A'],
        ['Priority', ticket.priority || 'N/A'],
    ];
    
    const wsTestCase = XLSX.utils.aoa_to_sheet(testCaseData);
    wsTestCase['!cols'] = [{ wch: 25 }, { wch: 80 }];
    
    // Apply formatting
    const range = XLSX.utils.decode_range(wsTestCase['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            if (!wsTestCase[cellAddress]) continue;
            
            wsTestCase[cellAddress].s = {
                alignment: { wrapText: true, vertical: 'top' },
                font: C === 0 ? { bold: true } : { bold: false }
            };
        }
    }
    
    XLSX.utils.book_append_sheet(wb, wsTestCase, 'Test Case Details');
    
    // Sheet 3: Test Steps (Table format with columns)
    const stepsHeader = ['Step #', 'Action', 'Expected Result', 'Actual Result', 'Status'];
    const stepsRows = ticket.stepsToReproduce && ticket.stepsToReproduce.length > 0
        ? ticket.stepsToReproduce.map((step, index) => [
            index + 1,
            step,
            index === ticket.stepsToReproduce.length - 1 ? (ticket.expectedResult || 'N/A') : 'Continue to next step',
            index === ticket.stepsToReproduce.length - 1 ? (ticket.actualResult || 'N/A') : 'N/A',
            index === ticket.stepsToReproduce.length - 1 ? 'FAILED' : 'N/A'
        ])
        : [[1, 'N/A', ticket.expectedResult || 'N/A', ticket.actualResult || 'N/A', 'FAILED']];
    
    const wsSteps = XLSX.utils.aoa_to_sheet([stepsHeader, ...stepsRows]);
    wsSteps['!cols'] = [
        { wch: 10 },
        { wch: 50 },
        { wch: 35 },
        { wch: 35 },
        { wch: 12 }
    ];
    
    // Style header row
    const headerRange = XLSX.utils.decode_range(wsSteps['!ref']);
    for (let C = headerRange.s.c; C <= headerRange.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
        if (!wsSteps[cellAddress]) wsSteps[cellAddress] = {};
        wsSteps[cellAddress].s = {
            font: { bold: true, color: { rgb: 'FFFFFF' } },
            fill: { fgColor: { rgb: '6366F1' } },
            alignment: { horizontal: 'center' }
        };
    }
    
    XLSX.utils.book_append_sheet(wb, wsSteps, 'Test Steps');
    
    // Sheet 4: Environment
    const env = ticket.environment || {};
    const envData = [
        ['ENVIRONMENT DETAILS'],
        [''],
        ['Property', 'Value'],
        ['App URL', env.appUrl || 'N/A'],
        ['Browser', env.browser || 'N/A'],
        ['OS', env.os || 'N/A'],
        ['Build Version', env.buildVersion || 'N/A'],
        ['Screen Resolution', 'N/A'],
        ['Timestamp', new Date().toISOString()],
    ];
    
    const wsEnv = XLSX.utils.aoa_to_sheet(envData);
    wsEnv['!cols'] = [{ wch: 25 }, { wch: 60 }];
    XLSX.utils.book_append_sheet(wb, wsEnv, 'Environment');
    
    // Download
    const fileName = `BUG_${(ticket.summary || 'ticket').replace(/[^a-zA-Z0-9]/g, '_').slice(0, 40)}.xlsx`;
    XLSX.writeFile(wb, fileName);
}

/**
 * Generate a comprehensive bug report document
 */
export async function generateBugReport(ticket, screenshotPreview) {
    const report = {
        ticketInfo: {
            testId: `TC_${(ticket.module || 'MOD').toUpperCase().slice(0, 4)}_${Date.now().toString().slice(-4)}`,
            project: ticket.project,
            issueType: ticket.issueType,
            summary: ticket.summary,
            module: ticket.module,
            feature: ticket.feature,
            severity: ticket.severity,
            priority: ticket.priority,
        },
        description: ticket.description,
        stepsToReproduce: ticket.stepsToReproduce || [],
        actualResult: ticket.actualResult,
        expectedResult: ticket.expectedResult,
        environment: ticket.environment || {},
        timestamp: new Date().toISOString(),
        hasScreenshot: !!screenshotPreview,
    };
    
    return report;
}
