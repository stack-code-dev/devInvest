const moneyInput = document.getElementById('moneyInput'); 
const moneyInputFake = document.getElementById('moneyInput-fake');
const rangeInput = document.getElementById('rangeInput');
const monthsInvested = document.querySelector('.time-invested span')
const monthValue = document.querySelector('.month-value');
const monthLabel = document.querySelectorAll('.month-label');
const amountInvestment = document.querySelector('.result-invested');
const totalsInvested = document.querySelector('.totals-invested')
const totalsGrossIncome = document.querySelector('.totals-gross-income')
const savingsInvested = document.querySelector('.totals-savings')
const ctx = document.getElementById('myChart');
const cdi = 0.1303;
const selic = 0.1175;

let newChartInvestment;

let moneyInputvalue = document.getElementById('moneyInput');
let investmentType = 'CDB';

let valueInvested = {
  CDB: {
    title: 'CDB e LC',
    value: '50,00',
    month: 10,
    total: 0,
    percentage: 1.27,
    amount: 55.44,
    investedTotal: 0.56,
    grossIncome: 56.80,
    savings: 50.26
  },
  LCI: {
    title: 'LCI e LCA',
    value: '80,50',
    month: 20,
    total: 0,
    percentage: 0.98,
    amount: 51,
    investedAmount: 0.56,
    grossIncome: 56.80,
    savings: 81.50
  }
};

let initialValue = valueInvested[investmentType];

moneyInput.value = initialValue.value
rangeInput.value = initialValue.month
monthsInvested.innerHTML = initialValue.month

// Mácara do input
moneyInput.addEventListener('input', function(event) {
  // Remove caracteres não numéricos
  const value = event.target.value.replace(/\D/g, '');
  
  // Formata o valor como moeda
  const formattedValue = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);

  // Atualiza o valor no campo de entrada
  event.target.value = formattedValue;

  // Atualiza o campo no span
  moneyInputFake.innerText = formattedValue
});

// Investment Input
moneyInputvalue.addEventListener('input', (e) => {
  valueInvested[investmentType].value = e.target.value
  handleCalcInvestment();
})

// Range Input
rangeInput.addEventListener('input', (e) => {
  monthsInvested.innerHTML = e.target.value
  monthValue.innerHTML = e.target.value

  monthLabel.forEach(month => {
    if(e.target.value == 1) {
      month.innerHTML = 'mês'
    } else {
      month.innerHTML = 'meses'
    }
  })
    
  valueInvested[investmentType].month = e.target.value;
  handleCalcInvestment();  
})

// Mudança de Tabs
function changeTab(type) {
  const tab = document.querySelectorAll('.tab li');
  
  tab.forEach(tab => tab.classList.remove('active-tab'))
  
  document.getElementById(`tab-${type}`).classList.add('active-tab')
  investmentType = type
  initialValue = valueInvested[investmentType];
  
  moneyInput.value = initialValue.value
  rangeInput.value = initialValue.month
  monthsInvested.innerHTML = initialValue.month
  monthValue.innerHTML = initialValue.month

  changeLabelInvestment(type);
  handleCalcInvestment()
}

// Alteração da legenda.
function changeLabelInvestment(type) {
  let investmentType = document.querySelector('.percentInvestmentType')

  type == 'CDB' 
    ? investmentType.innerHTML = 'CDB e LC: 127% do CDI.'
    : investmentType.innerHTML = 'LCI e LCA: 98% do CDI.'
}

// Handle Add
function hanldeControllersInput(param) {
  let amount = document.getElementById('moneyInput').value
  let valorNumber = parseFloat(amount.replace(/\./g, "").replace(",", "."));

  param == 'sum'
    ? numberResult = valorNumber + 50
    : numberResult = valorNumber - 50

  let numberResultFormated = parseFloat(numberResult.toFixed(2))
  
  if (numberResultFormated < 0 || numberResultFormated == 0) {
    numberResultFormated = 0
    moneyInput.value = 0
  }

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numberResultFormated);

  valueInvested[investmentType].value = formattedValue
  moneyInput.value = formattedValue
  handleCalcInvestment()
}

// m = cap*(1+i)^temp

// Calculo do investimento
async function handleCalcInvestment() {
  let finalValue = 0;
  let grossIncome = 0;
  let i = valueInvested[investmentType].percentage*cdi;

  let cap = parseFloat(valueInvested[investmentType].value.replace(/\./g, "").replace(",", "."))
  const ir = await handleIRTaxCalc();

  finalValue = cap * Math.pow((1 + i), (valueInvested[investmentType].month/12));

  investmentType == 'CDB'
    ? grossIncome = (cap + ((finalValue - cap)*ir))
    : grossIncome = finalValue

  valueInvested[investmentType].amount = Math.round(grossIncome*100)/100
  valueInvested[investmentType].grossIncome = Math.round(finalValue*100)/100
  
  handleCalcSavings()
}

// Aplicações de até 180 dias: 22,5%; 
// Aplicações entre 181 e 360 dias: 20%; 
// Aplicações entre 361 e 720 dias: 17,5%; 
// Aplicações maiores do que 720 dias: 15%. 

// Calculo da Taxa de IR
async function handleIRTaxCalc() {
  let n = valueInvested[investmentType].month * 30;
  let tx;

  switch(true) {
    case n <= 180:
      return tx = (1 - 0.225);
    case n >= 181 && n <= 360:
      return tx = (1- 0.2);
    case n >= 361 && n <= 720:
      return tx = (1- 0.175);
    case n > 721:
      return tx = (1 - 0.15)
  }

  return tx
}

// Calculo da poupança
function handleCalcSavings() {
  let finalValue = 0;
  let tx = 0;

  if(cdi >= 0.085) {
    tx = 0.005
  } else {
    tx = 0.7 * selic
  }
  
  let cap = parseFloat(valueInvested[investmentType].value.replace(/\./g, "").replace(",", "."))
  finalValue = cap * Math.pow((1 + tx), (valueInvested[investmentType].month/12));
  
  // Arredonda o valor para duas casa decimanis depois da virgula e injeta no obejto como um Number;
  valueInvested[investmentType].savings = Math.round(finalValue*100)/100
  
  handleShowInvestedTotals();
}

// Mostra totos os totais em tela
function handleShowInvestedTotals() {
  amountInvestment.innerHTML = formmaterCurrencyValue(valueInvested[investmentType].amount)
  totalsInvested.innerHTML = formmaterCurrencyValue(valueInvested[investmentType].value)
  totalsGrossIncome.innerHTML = formmaterCurrencyValue(valueInvested[investmentType].grossIncome)
  savingsInvested.innerHTML = formmaterCurrencyValue(valueInvested[investmentType].savings)

  hanldeUpdateChart();
}

function formmaterCurrencyValue(param) {
  return `${param.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`
}

handleCalcInvestment()

function hanldeUpdateChart() {
  newChartInvestment && newChartInvestment.destroy();

  newChartInvestment = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Poupança', valueInvested[investmentType].title],
      margin: '30px',
      datasets: [{
        borderColor: '#0038FF',
        backgroundColor: '#5A7FFF',
        data: [valueInvested[investmentType].savings, valueInvested[investmentType].amount],
        borderWidth: 1,
        borderRadius: 5,
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          display: false,
          grid: {
            display: false
          },
          ticks: {
            display: false
          }
        },
        x: {
          grid: {
            display: false
          },
          ticks: {
            display: true
          }
        }
      },
      plugins: {
        legend: false,
        tooltip: {
          callbacks: {
            label: label => `R$ ${formmaterCurrencyValue(label.formattedValue)}`
          }
        }
      }
    }
  })
}
