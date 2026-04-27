---
layout: course
title: "OpenSwarm — Robotique en essaim"
semestre: "S7"
type_cours: "projet"
tags: ["robotique", "essaim", "ROS", "Python", "algorithmes distribués", "IoT", "coordination"]
---

## Présentation du projet

**OpenSwarm** est un projet de SAE (Situation d'Apprentissage et d'Évaluation) du S7 consistant à développer des comportements coordonnés pour un **essaim de robots** (type E-puck, Thymio, ou drones). L'objectif est d'explorer les algorithmes distribués inspirés des systèmes biologiques (fourmis, abeilles, oiseaux).

---

## Intelligence en essaim (Swarm Intelligence)

### Définition

Un essaim est un **système multi-agents décentralisé** où le comportement global émerge des interactions locales entre agents simples — aucun agent n'a une vue globale du système.

### Propriétés clés

| Propriété | Description |
|-----------|-------------|
| **Décentralisation** | Pas de contrôleur central, chaque robot est autonome |
| **Robustesse** | Tolérance aux pannes individuelles |
| **Scalabilité** | Performance maintenue avec l'ajout d'agents |
| **Flexibilité** | Adaptation à des environnements changeants |
| **Comportement émergent** | Complexité globale issue de règles locales simples |

---

## Algorithmes fondamentaux

### Modèle de Boids (Craig Reynolds, 1986)

Simule le comportement d'un banc de poissons ou d'une nuée d'oiseaux avec 3 règles :

```python
import numpy as np

class Boid:
    def __init__(self, pos, vel):
        self.pos = np.array(pos, dtype=float)
        self.vel = np.array(vel, dtype=float)

    def update(self, boids, dt=0.1,
               separation_r=25, alignment_r=50, cohesion_r=50,
               sep_w=1.5, ali_w=1.0, coh_w=1.0):
        neighbors = [b for b in boids if b is not self
                     and np.linalg.norm(b.pos - self.pos) < cohesion_r]

        # 1. SÉPARATION : éviter les voisins trop proches
        separation = np.zeros(2)
        for b in neighbors:
            d = np.linalg.norm(b.pos - self.pos)
            if d < separation_r and d > 0:
                separation -= (b.pos - self.pos) / d

        # 2. ALIGNEMENT : s'aligner avec la direction des voisins
        alignment = np.zeros(2)
        if neighbors:
            alignment = np.mean([b.vel for b in neighbors], axis=0)
            if np.linalg.norm(alignment) > 0:
                alignment /= np.linalg.norm(alignment)

        # 3. COHÉSION : se diriger vers le centre du groupe
        cohesion = np.zeros(2)
        if neighbors:
            center = np.mean([b.pos for b in neighbors], axis=0)
            cohesion = center - self.pos
            if np.linalg.norm(cohesion) > 0:
                cohesion /= np.linalg.norm(cohesion)

        # Combinaison pondérée
        steering = (sep_w * separation + ali_w * alignment + coh_w * cohesion)
        self.vel += steering * dt
        # Limiter la vitesse
        speed = np.linalg.norm(self.vel)
        if speed > 5.0:
            self.vel = self.vel / speed * 5.0
        self.pos += self.vel * dt
```

### Stigmergie

Communication indirecte via l'environnement (comme les fourmis avec les phéromones).

```python
class PheromonGrid:
    """Grille de phéromones pour navigation en essaim."""
    def __init__(self, width, height, evaporation=0.95):
        self.grid = np.zeros((height, width))
        self.evaporation = evaporation

    def deposit(self, x, y, amount=1.0):
        self.grid[int(y), int(x)] += amount

    def evaporate(self):
        self.grid *= self.evaporation

    def gradient(self, x, y, radius=2):
        """Renvoie la direction vers la concentration max de phéromones."""
        best_dir = np.zeros(2)
        best_val = self.grid[int(y), int(x)]
        for dx in range(-radius, radius+1):
            for dy in range(-radius, radius+1):
                nx, ny = int(x)+dx, int(y)+dy
                if 0 <= nx < self.grid.shape[1] and 0 <= ny < self.grid.shape[0]:
                    if self.grid[ny, nx] > best_val:
                        best_val = self.grid[ny, nx]
                        best_dir = np.array([dx, dy], dtype=float)
        if np.linalg.norm(best_dir) > 0:
            best_dir /= np.linalg.norm(best_dir)
        return best_dir
```

---

## ROS 2 — Robot Operating System

### Architecture

```
ROS 2 Graph :

  /robot_1/sensors/lidar  (topic)
       │ Publisher
       └────────────────────► /swarm_coordinator (node)
                                        │
  /robot_2/sensors/lidar  (topic)       │ Service call
       │ Publisher                      │
       └────────────────────►           ▼
                               /path_planner (node)
  /swarm_cmd_vel (topic) ◄──────────────┘
       │
       ├──► /robot_1/cmd_vel
       └──► /robot_2/cmd_vel
```

### Nœud ROS 2 en Python

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist, PoseArray
from std_msgs.msg import Float32MultiArray
import numpy as np

class SwarmController(Node):
    def __init__(self):
        super().__init__('swarm_controller')

        # Paramètres configurables
        self.declare_parameter('robot_count', 5)
        self.declare_parameter('separation_distance', 0.5)
        self.n_robots = self.get_parameter('robot_count').value

        # Subscribers — positions des robots
        self.pose_sub = self.create_subscription(
            PoseArray, '/swarm/poses', self.pose_callback, 10)

        # Publishers — commandes de vitesse
        self.cmd_pubs = [
            self.create_publisher(Twist, f'/robot_{i}/cmd_vel', 10)
            for i in range(self.n_robots)
        ]

        # Timer — boucle de contrôle à 20 Hz
        self.timer = self.create_timer(0.05, self.control_loop)
        self.poses = []
        self.get_logger().info(f'SwarmController initialisé pour {self.n_robots} robots')

    def pose_callback(self, msg):
        self.poses = [(p.position.x, p.position.y) for p in msg.poses]

    def control_loop(self):
        if len(self.poses) < self.n_robots:
            return

        sep_dist = self.get_parameter('separation_distance').value

        for i, (x, y) in enumerate(self.poses):
            cmd = Twist()
            # Calcul des forces de séparation
            sep_force = np.zeros(2)
            for j, (ox, oy) in enumerate(self.poses):
                if i == j:
                    continue
                diff = np.array([x - ox, y - oy])
                dist = np.linalg.norm(diff)
                if 0 < dist < sep_dist:
                    sep_force += diff / (dist ** 2)

            cmd.linear.x = float(np.clip(sep_force[0], -0.3, 0.3))
            cmd.linear.y = float(np.clip(sep_force[1], -0.3, 0.3))
            self.cmd_pubs[i].publish(cmd)

def main(args=None):
    rclpy.init(args=args)
    node = SwarmController()
    rclpy.spin(node)
    node.destroy_node()
    rclpy.shutdown()
```

---

## Communication inter-robots

| Technologie | Portée | Débit | Usage |
|-------------|--------|-------|-------|
| Wi-Fi 802.11 | ~50 m | Élevé | Robots en espace ouvert |
| ZigBee | 10-100 m | Faible | Réseaux mesh basse conso |
| BLE | 10-50 m | Moyen | Robots compacts, IoT |
| Ultra Wide Band (UWB) | 10-50 m | Élevé | Localisation précise (<10 cm) |
| Infrarouge | <1 m | Faible | Robots miniatures (e-puck) |

### Protocole de consensus distribué

```python
# Algorithme de vote distribué (consensus byzantin simplifié)
class Robot:
    def __init__(self, robot_id: int, initial_value: float):
        self.id = robot_id
        self.value = initial_value
        self.neighbors = []

    def communicate(self) -> dict:
        return {'id': self.id, 'value': self.value}

    def update_consensus(self, neighbor_messages: list):
        """Moyenne des valeurs reçues — convergence vers le consensus."""
        values = [msg['value'] for msg in neighbor_messages] + [self.value]
        self.value = sum(values) / len(values)

def run_consensus(robots: list, iterations: int = 50):
    for step in range(iterations):
        messages = {r.id: r.communicate() for r in robots}
        for robot in robots:
            neighbor_msgs = [messages[n.id] for n in robot.neighbors]
            robot.update_consensus(neighbor_msgs)
        if step % 10 == 0:
            vals = [r.value for r in robots]
            print(f"Step {step}: min={min(vals):.3f}, max={max(vals):.3f}, std={np.std(vals):.4f}")
```

---

## Challenges du projet

### Problèmes rencontrés

| Défi | Solution |
|------|---------|
| Latence de communication | Buffer circulaire + protocole UDP |
| Désynchronisation des horloges | NTP + timestamps dans les messages |
| Pannes individuelles de robots | Algorithme de détection + réaffectation |
| Collisions | Champ potentiel répulsif + DWA (Dynamic Window Approach) |
| Localisation sans GPS indoor | UWB anchors + filtre de Kalman |

### Simulation avant déploiement

```bash
# Gazebo — simulation physique réaliste
ros2 launch swarm_description spawn_swarm.launch.py n_robots:=10

# Vérification des topics
ros2 topic list
ros2 topic echo /swarm/poses

# RViz2 — visualisation temps réel
rviz2 -d config/swarm_view.rviz
```

---

## Résultats et évaluation

**Métriques mesurées :**
- Temps de convergence (consensus)
- Distance moyenne entre robots (formation)
- Taux de couverture de zone (exploration)
- Taux de succès de navigation vers objectif
- Robustesse (% de réussite avec 1/3 des robots en panne)
