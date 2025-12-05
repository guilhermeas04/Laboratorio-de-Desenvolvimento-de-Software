package com.example.springboot.controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.springboot.model.Pedido;
import com.example.springboot.model.Veiculo;
import com.example.springboot.store.DataStore;

@RestController
@RequestMapping("/api/agent")
@CrossOrigin(origins = {"https://backstudentcoin.onrender.comw"})
public class AgentController {

    @GetMapping("/pedidos/pendentes")
    public List<Pedido> pendentes() {
        return DataStore.pedidos.values().stream()
                .filter(p -> "pendente".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());
    }

    @PostMapping("/avaliar/{id}")
    public ResponseEntity<Pedido> avaliar(@PathVariable String id, @RequestParam("acao") String acao) {
        Pedido p = DataStore.pedidos.get(id);
        if (p == null) return ResponseEntity.notFound().build();
        if ("aprovar".equalsIgnoreCase(acao)) p.setStatus("aprovado");
        else if ("reprovar".equalsIgnoreCase(acao)) p.setStatus("reprovado");
        return ResponseEntity.ok(p);
    }

    @GetMapping("/veiculos")
    public List<Veiculo> veiculos() {
        return DataStore.veiculos.values().stream().toList();
    }

    @PostMapping("/veiculos")
    public Veiculo criarVeiculo(@RequestBody Map<String,Object> body) {
        String id = "CAR-" + (int)(Math.random()*900 + 100);
        Veiculo v = new Veiculo(
                id,
                (String) body.getOrDefault("modelo","Modelo"),
                (String) body.getOrDefault("placa","ABC1D23"),
                ((Number) body.getOrDefault("ano",2024)).intValue(),
                (String) body.getOrDefault("cor","Prata"),
                ((Number) body.getOrDefault("diaria",100)).doubleValue()
        );
        DataStore.veiculos.put(id,v);
        return v;
    }
}
