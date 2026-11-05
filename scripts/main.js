
/* =========================================
   geometric dash cube dude
   made on mindustry v8 - Android
   ========================================= */

// =========================================
// 1. Unit stats here↓
// =========================================

const cube = extend(UnitType, "geometry-cube", {});

cube.localizedName = "Geo metri dash"
cube.description = "robtop"
cube.health = 100;
cube.speed = 2.5;
cube.hitSize = 10;
cube.armor = 0;

cube.rotateSpeed = 999999;
cube.drag = 0.05;
cube.accel = 1;

// Ground movement
cube.flying = false;
cube.hovering = false;
cube.physics = true;
cube.omniMovement = false;
cube.rotateMoveFirst = true;

// allow posession
cube.playerControllable = true;
cube.logicControllable = true;
cube.allowChangeCommands = false;

// =========================================
// 2. Math equation (useful) ↓
// =========================================

function snapDirection(angle) {
    return Mathf.round(angle / 90) * 90;
}

// =========================================
// 3. custom control AI
// =========================================

const AIController =
    Packages.mindustry.entities.units.AIController;

cube.aiController = prov(() =>
    extend(AIController, {

        updateMovement() {
            const unit = this.unit;

            // Snap to four directions
            unit.rotation = snapDirection(unit.rotation);

            // Always move forward
            Tmp.v1.trns(
                unit.rotation,
                unit.speed()
            );

            // Normal ground movement
            unit.movePref(Tmp.v1);
        }
    })
);


// =========================================
// 4. Possession fix / camera direction fix
// =========================================

Events.run(Trigger.update, () => {

    Groups.unit.each(cons(unit => {

        if (unit.type != cube) return;
        if (!unit.isPlayer()) return;

        // Get the player's camera position
        const player = unit.getPlayer();
        if (player == null) return;

        const cameraX = Core.camera.position.x;
        const cameraY = Core.camera.position.y;

        // Calculate direction from cube to camera
        const angle = unit.angleTo(cameraX, cameraY);

        // Snap to nearest cardinal direction
        unit.rotation = Mathf.round(angle / 90) * 90;

        // Continue forward
        Tmp.v1.trns(
            unit.rotation,
            unit.speed()
        );

        unit.movePref(Tmp.v1);

    }));

});

// =========================================
// 5. Big ass custom explosion animation
// =========================================

const cubeDeathEffect = new Effect(35, e => {

    // Calculate current animation frame
    const frame = Math.min(
        5,
        Math.floor(e.fin() * 5) + 1
    );

    // Find mod-prefixed sprite
    const region = Core.atlas.find(
        "geometry-cube-death-cube-" + frame
    );

    // Draw frame
    Draw.color(Color.white);
    Draw.rect(region, e.x, e.y, region.width * 3, region.height * 3);

    Draw.reset();
});

// Register death effect
cube.deathExplosionEffect = cubeDeathEffect;

// =========================================
// 6. Damage
// =========================================

const explosionRadius = 45;
const explosionDamage = 620;

Events.on(UnitDestroyEvent, cons(event => {
    const unit = event.unit;

    if (unit.type != cube) return;

    // Damage nearby enemy units and buildings
    Damage.damage(
        unit.team,
        unit.x,
        unit.y,
        explosionRadius,
        explosionDamage
    );
}));

// =========================================
// 7. Sprite Diagnostics
// =========================================

Events.on(ClientLoadEvent, cons(() => {

    Log.info("=== GEOMETRY CUBE SPRITES ===");

    for (let i = 1; i <= 5; i++) {

        const name = "geometry-cube-death-cube-" + i;

        Log.info(
            name + ": " + Core.atlas.has(name)
        );
    }

    Log.info("=============================");

    Vars.ui.showInfoToast(
        "gd cube loaded",
        4
    );

}));

