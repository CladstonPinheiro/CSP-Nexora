const inputData = $input.first().json;
let dataConsulta = inputData.data_consulta;

let dataFinal;

if (!dataConsulta) {
  const agoraMais24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const ano = agoraMais24h.getFullYear();
  const mesPad = String(agoraMais24h.getMonth() + 1).padStart(2, '0');
  const diaPad = String(agoraMais24h.getDate()).padStart(2, '0');
  dataFinal = `${ano}-${mesPad}-${diaPad}`;
} else {
  const [, mes, dia] = dataConsulta.split('-');
  const hoje = new Date();
  const anoAtual = hoje.getFullYear();
  let dataCorrigida = new Date(`${anoAtual}-${mes}-${dia}T00:00:00`);
  const hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dataCorrigidaSemHora = new Date(dataCorrigida.getFullYear(), dataCorrigida.getMonth(), dataCorrigida.getDate());
  if (dataCorrigidaSemHora < hojeSemHora) {
    dataCorrigida = new Date(`${anoAtual + 1}-${mes}-${dia}T00:00:00`);
  }
  const anoFinal = dataCorrigida.getFullYear();
  dataFinal = `${anoFinal}-${mes}-${dia}`;
}

return [{
  json: {
    ...inputData,
    data_consulta: dataFinal
  }
}];
