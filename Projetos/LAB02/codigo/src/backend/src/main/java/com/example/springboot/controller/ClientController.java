package com.example.springboot.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.springboot.model.Pedido;
import com.example.springboot.store.DataStore;

@RestController
@RequestMapping("/api/client")
@CrossOrigin(origins = {"https://backstudentcoin.onrender.comw"})
public class ClientController {

    @GetMapping("/pedidos")
    public List<Pedido> listarPedidos() {
        return new ArrayList<>(DataStore.pedidos.values());
    }

    @GetMapping("/pedidos/{id}")
    public ResponseEntity<Pedido> obter(@PathVariable String id) {
        Pedido p = DataStore.pedidos.get(id);
        if (p == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(p);
    }

    @PostMapping("/pedidos")
    public ResponseEntity<Pedido> criar(@RequestBody Map<String,Object> body) {
        String id = "PED-" + (int)(Math.random()*900 + 100);
        Pedido p = new Pedido(
                id,
                (String) body.getOrDefault("car","Modelo"),
                (String) body.getOrDefault("clientName","Cliente"),
                "pendente",
                (String) body.getOrDefault("date","2024-01-20"),
                (String) body.getOrDefault("value","R$ 100/dia")
        );
        DataStore.pedidos.put(id,p);
        return ResponseEntity.ok(p);
    }

    @PutMapping("/pedidos/{id}")
    public ResponseEntity<Pedido> atualizar(@PathVariable String id, @RequestBody Pedido dados) {
        Pedido p = DataStore.pedidos.get(id);
        if (p == null) return ResponseEntity.notFound().build();
        p.setCar(dados.getCar()!=null?dados.getCar():p.getCar());
        p.setDate(dados.getDate()!=null?dados.getDate():p.getDate());
        p.setValue(dados.getValue()!=null?dados.getValue():p.getValue());
        return ResponseEntity.ok(p);
    }

    @DeleteMapping("/pedidos/{id}")
    public ResponseEntity<Void> excluir(@PathVariable String id) {
        DataStore.pedidos.remove(id);
        return ResponseEntity.noContent().build();
    }
}
