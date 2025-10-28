import { Injectable, ElementRef } from '@angular/core';
import { ToastService } from '../../services/toast.service';

interface ProgressState {
  isDocLoading: boolean;
  docProgress: number;
  docProgressInterval?: any;
}

@Injectable({
  providedIn: 'root'
})
export class WordDownloadService {
  
  // Store progress state for each component instance
  private progressStates = new Map<ElementRef, ProgressState>();

  constructor(private toastService: ToastService) {}

  /**
   * Initialize progress state for an element
   */
  private getProgressState(elementRef: ElementRef): ProgressState {
    if (!this.progressStates.has(elementRef)) {
      this.progressStates.set(elementRef, {
        isDocLoading: false,
        docProgress: 0
      });
    }
    return this.progressStates.get(elementRef)!;
  }

  /**
   * Start progress simulation
   */
  startProgress(elementRef: ElementRef, type: 'doc'): void {
    const state = this.getProgressState(elementRef);
    if (type === 'doc') {
      state.docProgress = 0;
      state.docProgressInterval = setInterval(() => {
        if (state.docProgress < 90) {
          state.docProgress += Math.random() * 15;
        }
      }, 500);
    }
  }

  /**
   * Complete progress
   */
  completeProgress(elementRef: ElementRef, type: 'doc'): void {
    const state = this.getProgressState(elementRef);
    if (type === 'doc') {
      state.docProgress = 100;
      if (state.docProgressInterval) {
        clearInterval(state.docProgressInterval);
        state.docProgressInterval = null;
      }
    }
  }

  /**
   * Clear progress intervals
   */
  clearProgressIntervals(elementRef: ElementRef): void {
    const state = this.getProgressState(elementRef);
    if (state.docProgressInterval) {
      clearInterval(state.docProgressInterval);
      state.docProgressInterval = null;
    }
  }

  /**
   * Reset progress
   */
  resetProgress(elementRef: ElementRef): void {
    const state = this.getProgressState(elementRef);
    state.docProgress = 0;
    this.clearProgressIntervals(elementRef);
  }

  /**
   * Cancel loading
   */
  cancelLoading(elementRef: ElementRef): void {
    const state = this.getProgressState(elementRef);
    state.isDocLoading = false;
    this.resetProgress(elementRef);
    this.toastService.showError('Loading cancelled by user');
  }

  /**
   * Remove Angular ng-content attributes from HTML elements
   */
  removeNgContentAttributes(element: HTMLElement): string {
    if (element.attributes) {
      for (let i = 0; i < element.attributes.length; i++) {
        const attribute = element.attributes[i];
        if (attribute.name.startsWith('_ngcontent')) {
          element.removeAttribute(attribute.name);
        }
      }
    }
    if (element.children) {
      for (let i = 0; i < element.children.length; i++) {
        this.removeNgContentAttributes(element.children[i] as HTMLElement);
      }
    }
    return element.outerHTML;
  }

  /**
   * Main download function - converts HTML to Word document
   * @param elementRef - Reference to the component element
   * @param contentSelector - CSS selector for the content to download (e.g., '.printContainer', '#printContainer')
   * @returns Promise that resolves when download is complete
   */
  async downloadWord(elementRef: ElementRef, contentSelector: string): Promise<void> {
    // Dynamically import the library
    const { asBlob } = await import('html-docx-js-typescript');
    
    const state = this.getProgressState(elementRef);
    state.isDocLoading = true;
    this.startProgress(elementRef, 'doc');
    
    try {
      const htmlContent = elementRef.nativeElement.querySelector(contentSelector);
      
      if (htmlContent) {
        const string = this.removeNgContentAttributes(htmlContent);
        const data: Blob = await asBlob(string) as Blob;
        const url = URL.createObjectURL(data);
        window.open(url, '_blank');
        
        this.completeProgress(elementRef, 'doc');
        setTimeout(() => {
          state.isDocLoading = false;
          state.docProgress = 0;
        }, 1000);
        this.toastService.showSuccess('Word document generated successfully');
      } else {
        this.completeProgress(elementRef, 'doc');
        setTimeout(() => {
          state.isDocLoading = false;
          state.docProgress = 0;
        }, 1000);
        this.toastService.showError('HTML content not found');
      }
    } catch (error) {
      console.error('Error generating Word document:', error);
      this.completeProgress(elementRef, 'doc');
      setTimeout(() => {
        state.isDocLoading = false;
        state.docProgress = 0;
      }, 1000);
      this.toastService.showError('Failed to generate Word document');
    }
  }

  /**
   * Get loading state
   */
  getLoadingState(elementRef: ElementRef): boolean {
    const state = this.getProgressState(elementRef);
    return state.isDocLoading;
  }

  /**
   * Get progress percentage
   */
  getProgress(elementRef: ElementRef): number {
    const state = this.getProgressState(elementRef);
    return state.docProgress;
  }

  /**
   * Cleanup when component is destroyed
   */
  ngOnDestroy(elementRef: ElementRef): void {
    this.clearProgressIntervals(elementRef);
    this.progressStates.delete(elementRef);
  }
}

