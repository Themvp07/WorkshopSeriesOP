const CONTRACT_ADDRESS = "0x7FbcFdc22a28f756d060E5b1679E66C3028338F3";
const ABI = [
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "learning",
          "type": "string"
        }
      ],
      "name": "addLearner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getAllLearners",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "from",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "learning",
              "type": "string"
            }
          ],
          "internalType": "struct ChainJourney.Learner[]",
          "name": "",
          "type": "tuple[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]
;

const provider = new ethers.providers.Web3Provider(window.ethereum);
let account = "";

/*
async function connectWallet() {
  let accountList = await provider.send("eth_requestAccounts", []);
  account = accountList[0];
  document.getElementById("caccount").innerHTML =
    "Current Account is :" + account;
  getlearners();
}
*/

// Agrega una función para mostrar el título
function showTitle() {
  const titleElement = document.getElementById('mainTitle');
  titleElement.style.display = 'block';
}

// Llama a la función para mostrar el título al cargar la página
window.addEventListener('load', function() {
  showTitle();
});

// Definir la función en un ámbito global
async function connectWallet() {
  try {
    // Verificar si MetaMask está instalado y conectado
    if (typeof ethereum !== 'undefined' && ethereum.isMetaMask) {
      // Solicitar acceso a las cuentas de MetaMask
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });

      // Si hay varias cuentas, permitir al usuario elegir
      if (accounts.length > 1) {
        const selectedAccount = await chooseAccount(accounts);
        if (!selectedAccount) {
          console.error('Account selection cancelled.');
          return;
        }
        account = selectedAccount;
      } else {
        account = accounts[0];
      }

      document.getElementById("caccount").innerHTML = "La cuenta conectada es: " + account;

      // Mostrar la vista principal después del inicio de sesión
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('formSection').style.display = 'block';

      // Obtener y mostrar los aprendices después del inicio de sesión
      getlearners();
    } else {
      console.error('MetaMask not detected or not installed.');
    }
  
  // Llama a la función para mostrar el título
    showTitle();

  } catch (error) {
    console.error('Error connecting to MetaMask:', error);
  }
}

// Función para elegir una cuenta si hay múltiples cuentas disponibles
async function chooseAccount(accounts) {
  return new Promise(resolve => {
    const accountButtons = accounts.map((acc, index) => {
      const button = document.createElement('button');
      button.textContent = `Use la cuenta ${index + 1}`;
      button.onclick = () => {
        modal.remove();
        resolve(acc);
      };
      return button;
    });

    const modal = document.createElement('div');
    modal.className = 'account-chooser';
    modal.textContent = 'Seleccione una cuenta:';
    accountButtons.forEach(btn => modal.appendChild(btn));
    document.body.appendChild(modal);

    // Limpiar la selección si se cierra el modal
    modal.onclick = (event) => {
      if (event.target === modal) {
        modal.remove();
        resolve(null);
      }
    };

    // Enfoque inicial en el primer botón
    accountButtons[0].focus();
  });
}

// Función para desconectar la cuenta de MetaMask
function disconnectWallet() {
  ethereum
    .send('wallet_requestPermissions', [
      { eth_accounts: {} },
    ])
    .then(permissions => {
      if (permissions) {
        // Desconectar la cuenta de MetaMask
        ethereum.send('wallet_removePermissions', [
          { eth_accounts: {} },
        ]).then(() => {
          // Reiniciar la aplicación después de desconectar
          window.location.reload();
        });
      }
    })
    .catch(error => {
      console.error('Error disconnecting from MetaMask:', error);
    });
}



function getContract() {
  let signer = provider.getSigner(account);
  let contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
  return contract;
}

async function getlearners() {
  let contract = getContract();
  let learners = await contract.getAllLearners();
   console.log(learners);
  for (const item of learners) {
    appendCard(item);
  }
}

function appendCard(item) {
  let container = document.getElementsByClassName("container")[0];
  let card = document.createElement("div");
  card.className = "card";
  card.innerHTML =
    "Address " + item.from + "<br/>" + "Learning : " + item.learning;
  container.append(card);
}

async function addLearner() {
  let learningtext = document.getElementById("inputText");
  if (learningtext.value === "") {
    learningtext.style.border = "2px solid red";
    learningtext.setAttribute("placeholder", "This filed can not be blank");
    return;
  }
  let contract = getContract();
  let txn = await contract.addLearner(learningtext.value);
  let showhash = document.getElementById("txnhash");
  let a = document.createElement("a");
//  a.href = `https://moonbase.moonscan.io/tx/${txn.hash}`; //Explorador para moonbase
  a.href = `https://optimism-sepolia.blockscout.com/tx/${txn.hash}`; //Explorador ara Optimism sepolia
  a.innerHTML = "Follow your transaction here";
  showhash.append(a);
  await txn.wait();
  history.go(0);
}

window.addEventListener("load", function () {
  connectWallet();
});

// Nueva función para calcular el hash SHA256 de un archivo
async function calculateHash() {
    try {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];
        if (!file) {
            console.error('No file selected.');
            return;
        }

        const reader = new FileReader();
        reader.onload = async function () {
            const fileBuffer = reader.result;
            const hash = await sha256(fileBuffer);
            document.getElementById('hashDisplay').textContent = `File Hash (SHA256): ${hash}`;
        };
        reader.readAsArrayBuffer(file);
    } catch (error) {
        console.error('Error calculating hash:', error);
    }
}

// Función para calcular el hash SHA256 de un buffer
async function sha256(buffer) {
    const digest = await crypto.subtle.digest('SHA-256', buffer);
    return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

// Función para copiar el hash SHA256 al portapapeles
function copyHash() {
    const hashDisplay = document.getElementById('hashDisplay');
    const tempInput = document.createElement('input');
    tempInput.value = hashDisplay.textContent.split(': ')[1];
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    alert('Hash copiado en portapapeles!');
}
