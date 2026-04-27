---
layout: course
title: "Deep Learning"
semestre: "S8"
type_cours: "data"
tags: ["CNN", "RNN", "LSTM", "Transformer", "PyTorch", "transfer learning", "backpropagation", "attention"]
---

## Introduction

Le Deep Learning est une sous-branche du Machine Learning utilisant des réseaux de neurones profonds (plusieurs couches cachées) pour apprendre des représentations hiérarchiques à partir des données. Il domine aujourd'hui la vision, le traitement du langage et la génération de contenu.

---

## Neurone artificiel et perceptron

### Neurone de McCulloch-Pitts

$$y = f\left(\sum_{i=1}^{n} w_i x_i + b\right)$$

- $x_i$ : entrées
- $w_i$ : poids synaptiques
- $b$ : biais
- $f$ : fonction d'activation

### Fonctions d'activation

| Fonction | Formule | Plage | Usage |
|---------|---------|-------|-------|
| Sigmoid | $\sigma(x) = \frac{1}{1+e^{-x}}$ | (0,1) | Sortie binaire |
| Tanh | $\tanh(x)$ | (-1,1) | RNN, couches cachées |
| ReLU | $\max(0, x)$ | [0,+∞) | **Standard** hidden layers |
| LeakyReLU | $\max(0.01x, x)$ | ℝ | Évite dying ReLU |
| GELU | $x \cdot \Phi(x)$ | ℝ | Transformers |
| Softmax | $\frac{e^{x_i}}{\sum_j e^{x_j}}$ | (0,1), sum=1 | Sortie multi-classes |

---

## Backpropagation

Algorithme de calcul des gradients par la règle de la chaîne :

$$\frac{\partial L}{\partial w} = \frac{\partial L}{\partial \hat{y}} \cdot \frac{\partial \hat{y}}{\partial z} \cdot \frac{\partial z}{\partial w}$$

```python
import torch
import torch.nn as nn

# PyTorch gère automatiquement la backpropagation via autograd
x = torch.tensor([[1.0, 2.0, 3.0]])
y = torch.tensor([[1.0]])

model = nn.Sequential(
    nn.Linear(3, 16),
    nn.ReLU(),
    nn.Linear(16, 1)
)

criterion = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.001)

# Forward pass
y_pred = model(x)
loss = criterion(y_pred, y)

# Backward pass
optimizer.zero_grad()
loss.backward()       # Calcul des gradients
optimizer.step()      # Mise à jour des poids
```

---

## CNN — Convolutional Neural Networks

### Architecture typique

```
Input image      Conv2D + ReLU   MaxPool    Conv2D + ReLU   FC     Output
(3, 224, 224) → (32, 222, 222) → (32,111,111) → (64,55,55) → 512 → n_classes
```

### Opérations clés

```python
import torch.nn as nn
import torch.nn.functional as F

class ConvNet(nn.Module):
    def __init__(self, num_classes=10):
        super().__init__()
        # Bloc convolutif 1
        self.conv1 = nn.Conv2d(3, 32, kernel_size=3, padding=1)
        self.bn1   = nn.BatchNorm2d(32)
        # Bloc convolutif 2
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2   = nn.BatchNorm2d(64)
        # Bloc convolutif 3
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3   = nn.BatchNorm2d(128)
        # Classifieur
        self.pool  = nn.AdaptiveAvgPool2d((4, 4))
        self.dropout = nn.Dropout(0.5)
        self.fc1   = nn.Linear(128 * 4 * 4, 512)
        self.fc2   = nn.Linear(512, num_classes)

    def forward(self, x):
        x = F.max_pool2d(F.relu(self.bn1(self.conv1(x))), 2)  # 112x112
        x = F.max_pool2d(F.relu(self.bn2(self.conv2(x))), 2)  # 56x56
        x = F.max_pool2d(F.relu(self.bn3(self.conv3(x))), 2)  # 28x28
        x = self.pool(x)                                        # 4x4
        x = x.view(x.size(0), -1)                              # Flatten
        x = self.dropout(F.relu(self.fc1(x)))
        return self.fc2(x)
```

---

## Transfer Learning

Réutiliser des poids pré-entraînés sur ImageNet (ResNet, EfficientNet, ViT...).

```python
import torchvision.models as models

# 1. Fine-tuning complet (peu de données → geler le backbone)
model = models.resnet50(weights='IMAGENET1K_V2')

# Geler toutes les couches
for param in model.parameters():
    param.requires_grad = False

# Remplacer la tête de classification
in_features = model.fc.in_features
model.fc = nn.Sequential(
    nn.Dropout(0.3),
    nn.Linear(in_features, 256),
    nn.ReLU(),
    nn.Linear(256, num_classes)
)

# Seule la tête est entraînable
optimizer = torch.optim.AdamW(model.fc.parameters(), lr=1e-3)

# 2. Fine-tuning avec désgel progressif
for name, param in model.named_parameters():
    if 'layer4' in name or 'fc' in name:
        param.requires_grad = True
    else:
        param.requires_grad = False

optimizer = torch.optim.AdamW([
    {'params': model.layer4.parameters(), 'lr': 1e-4},
    {'params': model.fc.parameters(), 'lr': 1e-3}
])
```

---

## RNN, LSTM, GRU

### Problème du gradient vanishing

Dans les RNN, les gradients s'annulent (ou explosent) sur les longues séquences → les LSTM résolvent ce problème avec des portes.

### LSTM — Long Short-Term Memory

$$f_t = \sigma(W_f [h_{t-1}, x_t] + b_f)  \quad \text{(oubli)}$$
$$i_t = \sigma(W_i [h_{t-1}, x_t] + b_i)  \quad \text{(entrée)}$$
$$\tilde{C}_t = \tanh(W_C [h_{t-1}, x_t] + b_C)$$
$$C_t = f_t \odot C_{t-1} + i_t \odot \tilde{C}_t  \quad \text{(état cellule)}$$
$$o_t = \sigma(W_o [h_{t-1}, x_t] + b_o)$$
$$h_t = o_t \odot \tanh(C_t)  \quad \text{(état caché)}$$

```python
class LSTMClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim, hidden_dim, num_layers, num_classes):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, num_layers,
                            batch_first=True, dropout=0.3, bidirectional=True)
        self.classifier = nn.Linear(hidden_dim * 2, num_classes)

    def forward(self, x):
        embedded = self.embedding(x)                       # (B, T, E)
        output, (h_n, _) = self.lstm(embedded)             # (B, T, 2H)
        # Concaténer les états finals des 2 directions
        h_forward  = h_n[-2, :, :]
        h_backward = h_n[-1, :, :]
        hidden = torch.cat([h_forward, h_backward], dim=1)
        return self.classifier(hidden)
```

---

## Transformers et Attention

### Self-Attention

$$\text{Attention}(Q, K, V) = \text{Softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V$$

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model=512, n_heads=8):
        super().__init__()
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        self.W_q = nn.Linear(d_model, d_model)
        self.W_k = nn.Linear(d_model, d_model)
        self.W_v = nn.Linear(d_model, d_model)
        self.W_o = nn.Linear(d_model, d_model)

    def forward(self, q, k, v, mask=None):
        B = q.size(0)
        Q = self.W_q(q).view(B, -1, self.n_heads, self.d_k).transpose(1, 2)
        K = self.W_k(k).view(B, -1, self.n_heads, self.d_k).transpose(1, 2)
        V = self.W_v(v).view(B, -1, self.n_heads, self.d_k).transpose(1, 2)

        scores = torch.matmul(Q, K.transpose(-2, -1)) / (self.d_k ** 0.5)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
        attn = F.softmax(scores, dim=-1)

        out = torch.matmul(attn, V)
        out = out.transpose(1, 2).contiguous().view(B, -1, self.n_heads * self.d_k)
        return self.W_o(out)
```

### Utiliser BERT (HuggingFace)

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch

model_name = "camembert-base"    # BERT français
tokenizer  = AutoTokenizer.from_pretrained(model_name)
model      = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

texts = ["Ce film est excellent !", "Je n'ai pas apprécié du tout."]
inputs = tokenizer(texts, padding=True, truncation=True,
                   max_length=512, return_tensors="pt")

with torch.no_grad():
    outputs = model(**inputs)
    predictions = torch.softmax(outputs.logits, dim=-1)
    labels = torch.argmax(predictions, dim=-1)

print(labels)  # [1, 0] = [positif, négatif]
```

---

## Pipeline d'entraînement complet

```python
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms

# Augmentation de données (training)
train_transform = transforms.Compose([
    transforms.RandomResizedCrop(224),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

val_transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

train_ds = datasets.ImageFolder('data/train', transform=train_transform)
val_ds   = datasets.ImageFolder('data/val',   transform=val_transform)
train_loader = DataLoader(train_ds, batch_size=64, shuffle=True, num_workers=4, pin_memory=True)
val_loader   = DataLoader(val_ds,   batch_size=64, shuffle=False, num_workers=4)

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model  = ConvNet(num_classes=len(train_ds.classes)).to(device)
optimizer  = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
scheduler  = torch.optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=30)
criterion  = nn.CrossEntropyLoss(label_smoothing=0.1)

best_acc = 0.0
for epoch in range(30):
    # --- Entraînement ---
    model.train()
    train_loss, correct, total = 0, 0, 0
    for images, labels in train_loader:
        images, labels = images.to(device), labels.to(device)
        optimizer.zero_grad()
        outputs = model(images)
        loss = criterion(outputs, labels)
        loss.backward()
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        train_loss += loss.item()
        correct    += (outputs.argmax(1) == labels).sum().item()
        total      += labels.size(0)

    # --- Validation ---
    model.eval()
    val_correct, val_total = 0, 0
    with torch.no_grad():
        for images, labels in val_loader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            val_correct += (outputs.argmax(1) == labels).sum().item()
            val_total   += labels.size(0)

    val_acc = val_correct / val_total
    scheduler.step()

    print(f"Epoch {epoch+1:2d} | Train loss: {train_loss/len(train_loader):.4f} "
          f"| Train acc: {correct/total:.3f} | Val acc: {val_acc:.3f}")

    if val_acc > best_acc:
        best_acc = val_acc
        torch.save(model.state_dict(), 'best_model.pth')
```

---

## Résumé

| Architecture | Forces | Cas d'usage |
|-------------|--------|-------------|
| MLP | Simple, rapide | Données tabulaires |
| CNN | Localité spatiale | Vision, audio spectrogram |
| RNN/LSTM/GRU | Séquences | NLP classique, time-series |
| Transformer | Attention globale | NLP, vision (ViT), multimodal |
| ResNet/EfficientNet | Transfer learning | Classification images |
| BERT/GPT | Pré-entraîné | NLP, generation, embedding |
