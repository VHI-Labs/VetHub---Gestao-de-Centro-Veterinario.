import type { Pet } from '../types'
import { cleanText } from './engine'

export function triggerPrintPrescription(petData: Pet) {
  let printArea = document.getElementById('print-area-wrapper')
  if (!printArea) {
    printArea = document.createElement('div')
    printArea.id = 'print-area-wrapper'
    document.body.appendChild(printArea)
  }

  const dataFormatada = new Date(petData.dataHora).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  printArea.innerHTML = `
    <div class="print-prescription">
      <div class="print-corner-decor top-left"></div>
      <div class="print-corner-decor top-right"></div>
      <div class="print-corner-decor bottom-left"></div>
      <div class="print-corner-decor bottom-right"></div>
      <div class="print-watermark" style="font-size: 60px; opacity: 0.15;">🐾</div>
      <div class="print-header">
        <div class="print-header-logo">Anhembi Morumbi | <span style="font-weight: 400;">HOVET</span></div>
        <div class="print-header-info">Hospital Veterinário Universitário<br>Universidade Anhembi Morumbi - Grupo Ânima<br>São Paulo - SP</div>
      </div>
      <div class="print-title">Ficha de Encaminhamento</div>
      <div class="print-section">
        <div class="print-section-title">Informações do Atendimento</div>
        <div class="print-grid">
          <div class="print-field"><strong>Ficha / Senha</strong><span>${cleanText(petData.senha, 'Não informado')}</span></div>
          <div class="print-field"><strong>Espécie</strong><span>${cleanText(petData.especie, 'Não informado')}</span></div>
          <div class="print-field"><strong>Tipo de Atendimento</strong><span>${cleanText(petData.tipoAtendimento, 'Não informado')}</span></div>
          <div class="print-field"><strong>Classificação de Risco</strong><span style="color: ${petData.prioridade === 'Vermelho' ? 'var(--priority-red)' : petData.prioridade === 'Amarelo' ? 'var(--priority-yellow)' : 'var(--priority-green)'}; font-weight: 700;">${cleanText(petData.prioridade, 'Verde').toUpperCase()}</span></div>
        </div>
      </div>
      <div class="print-section">
        <div class="print-section-title">Conduta Veterinária / Prescrição</div>
        <div class="print-body"><strong>Direcionado para: ${cleanText(petData.localDirecionado, 'Atendimento Geral')}</strong><br><br>Evolução clínica, medicamentos ministrados e exames complementares solicitados devem ser descritos neste espaço pelo médico veterinário responsável.</div>
      </div>
      <div class="print-footer">
        <div class="print-signature-line"></div>
        <div class="print-signature-text">Médico Veterinário Residente / Supervisor<br>HOVET Anhembi Morumbi<br>Data de Emissão: ${dataFormatada}</div>
      </div>
    </div>
  `

  window.print()
}
