import React from "react";
import { Check, ArrowLeft, ArrowRight } from "lucide-react";

export function ProgressSteps({ steps, currentStep }) {
  return (
    <div className="flex items-start w-full mb-8 overflow-x-auto pb-1">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isDone = i < currentStep;
        return (
          // Key'i title yerine index ile birleştirdik (daha güvenli)
          <React.Fragment key={`${step.title}-${i}`}>
            <div className="flex flex-col items-center text-center shrink-0" style={{ width: 96 }}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0
                  ${isDone ? "bg-[#16233D] text-white" : isActive ? "bg-[#2E4A7D] text-white" : "bg-[#E5E7EC] text-[#8A8C93]"}
                `}
              >
                {isDone ? <Check size={14} /> : i + 1}
              </div>
              <p className={`text-[11px] mt-1.5 leading-tight ${isActive ? "text-[#16233D] font-semibold" : "text-[#8A8C93]"}`}>
                {step.title}
              </p>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-[2px] mt-4 min-w-[16px] ${isDone ? "bg-[#16233D]" : "bg-[#E5E7EC]"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function WizardShell({ steps, step, children, canProceed, onBack, onNext, onSave, isLastStep, saved, saveLabel = "Kaydet" }) {
  return (
    <div className="rounded-xl border border-[#DADCE3] bg-white p-6 md:p-8">
      <ProgressSteps steps={steps} currentStep={step} />

      {/* Burası adım bazlı bir anahtar ile sarılıyor, böylece React aynı
         adım içeriğini yanlışlıkla başka bir adımın DOM elementiyle eşlemez. */}
      <div className="min-h-[260px]" key={step}>
        {children}
      </div>

      <div className="flex items-center justify-between pt-6 mt-6 border-t border-[#EBEBEB]">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 0}
          className="flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#16233D] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft size={16} /> Geri
        </button>

        {!isLastStep ? (
          <button
            type="button"
            onClick={onNext}
            disabled={!canProceed}
            className="flex items-center gap-1.5 rounded-md bg-[#16233D] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#1F3153] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Sonraki Aşama <ArrowRight size={16} />
          </button>
        ) : (
          <button
            type="button"
            onClick={onSave}
            disabled={saved}
            className="flex items-center gap-1.5 rounded-md bg-[#2E4A7D] text-white px-5 py-2.5 text-sm font-medium hover:bg-[#25406B] disabled:opacity-60 transition-colors"
          >
            {saved ? <><Check size={16} /> Kaydedildi</> : <><Check size={16} /> {saveLabel}</>}
          </button>
        )}
      </div>
    </div>
  );
}